import fs from 'fs';
import path from 'path';

// Helper to generate authentic 24-character hex MongoDB ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return (timestamp + machineId + processId + counter).slice(0, 24);
}

export interface MongoQuery {
  [key: string]: any;
}

export interface MongoOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export class MongoCollection<T extends { _id?: string }> {
  name: string;
  private db: MongoDatabase;

  constructor(name: string, db: MongoDatabase) {
    this.name = name;
    this.db = db;
  }

  private matchCondition(value: any, condition: any): boolean {
    if (condition === null || condition === undefined) {
      return value === condition;
    }

    if (typeof condition === 'object' && !Array.isArray(condition)) {
      for (const operator of Object.keys(condition)) {
        const target = condition[operator];
        if (operator === '$eq') {
          if (value !== target) return false;
        } else if (operator === '$ne') {
          if (value === target) return false;
        } else if (operator === '$gt') {
          if (Number(value) <= Number(target)) return false;
        } else if (operator === '$gte') {
          if (Number(value) < Number(target)) return false;
        } else if (operator === '$lt') {
          if (Number(value) >= Number(target)) return false;
        } else if (operator === '$lte') {
          if (Number(value) > Number(target)) return false;
        } else if (operator === '$in') {
          if (!Array.isArray(target) || !target.includes(value)) return false;
        } else if (operator === '$nin') {
          if (Array.isArray(target) && target.includes(value)) return false;
        } else if (operator === '$regex') {
          const flags = condition.$options || 'i';
          const re = new RegExp(target, flags);
          if (!re.test(String(value ?? ''))) return false;
        }
      }
      return true;
    }

    // Direct equality
    return value === condition;
  }

  private filterDoc(doc: any, query: MongoQuery): boolean {
    for (const key of Object.keys(query)) {
      if (key === '$or' && Array.isArray(query.$or)) {
        const matchesAny = query.$or.some(subQuery => this.filterDoc(doc, subQuery));
        if (!matchesAny) return false;
        continue;
      }

      if (key === '$and' && Array.isArray(query.$and)) {
        const matchesAll = query.$and.every(subQuery => this.filterDoc(doc, subQuery));
        if (!matchesAll) return false;
        continue;
      }

      const val = doc[key];
      const condition = query[key];
      if (!this.matchCondition(val, condition)) {
        return false;
      }
    }
    return true;
  }

  async find(query: MongoQuery = {}, options: MongoOptions = {}): Promise<T[]> {
    const docs = this.db.getData()[this.name] || [];
    let matched = docs.filter(doc => this.filterDoc(doc, query));

    // Sorting
    if (options.sort) {
      const [field, direction] = Object.entries(options.sort)[0] || [];
      if (field) {
        matched.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return direction === 1 ? valA - valB : valB - valA;
          }
          return direction === 1
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });
      }
    }

    if (options.skip) {
      matched = matched.slice(options.skip);
    }
    if (options.limit && options.limit > 0) {
      matched = matched.slice(0, options.limit);
    }

    // Deep clone to prevent mutation
    return JSON.parse(JSON.stringify(matched));
  }

  async findOne(query: MongoQuery = {}): Promise<T | null> {
    const docs = this.db.getData()[this.name] || [];
    const doc = docs.find(d => this.filterDoc(d, query));
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ _id: id });
  }

  async insertOne(doc: Partial<T>): Promise<T> {
    const data = this.db.getData();
    if (!data[this.name]) {
      data[this.name] = [];
    }

    const newDoc: any = {
      _id: (doc as any)._id || generateObjectId(),
      ...doc,
      createdAt: (doc as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data[this.name].push(newDoc);
    await this.db.save();
    return JSON.parse(JSON.stringify(newDoc));
  }

  async insertMany(docs: Partial<T>[]): Promise<T[]> {
    const inserted: T[] = [];
    for (const d of docs) {
      const res = await this.insertOne(d);
      inserted.push(res);
    }
    return inserted;
  }

  async updateOne(query: MongoQuery, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    const data = this.db.getData();
    const docs = data[this.name] || [];
    const index = docs.findIndex(d => this.filterDoc(d, query));

    if (index === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const current = docs[index];
    if (update.$set) {
      Object.assign(current, update.$set);
    }
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        current[k] = (Number(current[k]) || 0) + Number(v);
      }
    }
    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        if (!Array.isArray(current[k])) current[k] = [];
        current[k].push(v);
      }
    }

    current.updatedAt = new Date().toISOString();
    await this.db.save();
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query: MongoQuery): Promise<{ deletedCount: number }> {
    const data = this.db.getData();
    const docs = data[this.name] || [];
    const index = docs.findIndex(d => this.filterDoc(d, query));

    if (index === -1) {
      return { deletedCount: 0 };
    }

    docs.splice(index, 1);
    await this.db.save();
    return { deletedCount: 1 };
  }

  async countDocuments(query: MongoQuery = {}): Promise<number> {
    const docs = this.db.getData()[this.name] || [];
    return docs.filter(d => this.filterDoc(d, query)).length;
  }
}

export class MongoDatabase {
  private dataFilePath: string;
  private cache: Record<string, any[]> = {};
  private initialized = false;

  constructor(filePath: string) {
    this.dataFilePath = filePath;
  }

  collection<T extends { _id?: string }>(name: string): MongoCollection<T> {
    this.ensureInitialized();
    return new MongoCollection<T>(name, this);
  }

  getData(): Record<string, any[]> {
    this.ensureInitialized();
    return this.cache;
  }

  private ensureInitialized() {
    if (this.initialized) return;

    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.cache = JSON.parse(raw);
      } else {
        this.cache = {};
      }
    } catch (e) {
      console.error('Failed to read MongoDB file store:', e);
      this.cache = {};
    }

    this.initialized = true;
  }

  async save(): Promise<void> {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save MongoDB file store:', e);
    }
  }

  async getCollectionNames(): Promise<string[]> {
    this.ensureInitialized();
    return Object.keys(this.cache);
  }

  async resetData(initialData: Record<string, any[]>): Promise<void> {
    this.cache = JSON.parse(JSON.stringify(initialData));
    await this.save();
  }

  getStats() {
    this.ensureInitialized();
    const stats: Record<string, { count: number; sampleId?: string }> = {};
    let totalDocs = 0;
    for (const [col, docs] of Object.entries(this.cache)) {
      stats[col] = {
        count: docs.length,
        sampleId: docs[0]?._id,
      };
      totalDocs += docs.length;
    }
    return {
      connected: true,
      database: 'aura_living_db',
      version: '7.0.5-embedded',
      collections: stats,
      totalDocuments: totalDocs,
      storagePath: this.dataFilePath,
      lastSynced: new Date().toISOString(),
    };
  }
}

// Global Singleton for the Express App
const DATA_PATH = path.resolve(process.cwd(), 'data', 'mongodb_data.json');
export const db = new MongoDatabase(DATA_PATH);
