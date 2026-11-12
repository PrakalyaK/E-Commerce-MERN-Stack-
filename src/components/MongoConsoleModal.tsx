import React, { useEffect, useState } from 'react';
import { MongoDbStats } from '../types/store';
import { fetchMongoStats, executeMongoQuery, resetDatabase } from '../services/api';
import { X, Database, Terminal, RefreshCw, Layers, CheckCircle2, RotateCcw, Search, Plus } from 'lucide-react';

interface MongoConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const MongoConsoleModal: React.FC<MongoConsoleModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [stats, setStats] = useState<MongoDbStats | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>('products');
  const [collectionDocs, setCollectionDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'query' | 'stats'>('documents');
  const [queryInput, setQueryInput] = useState('{"stock": {"$gt": 0}}');
  const [queryResult, setQueryResult] = useState<any>(null);

  const loadStatsAndDocs = async () => {
    try {
      setLoading(true);
      const st = await fetchMongoStats();
      setStats(st);

      const docs = await executeMongoQuery(activeCollection, 'find', {});
      setCollectionDocs(docs);
    } catch (err) {
      console.error('Failed to load MongoDB data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatsAndDocs();
    }
  }, [isOpen, activeCollection]);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!confirm('Reset all MongoDB collections to default curated seed state?')) return;
    try {
      setResetting(true);
      await resetDatabase();
      await loadStatsAndDocs();
      onDataChanged();
    } catch (err: any) {
      alert(err.message || 'Failed to reset MongoDB');
    } finally {
      setResetting(false);
    }
  };

  const handleRunQuery = async () => {
    try {
      let parsed = {};
      if (queryInput.trim()) {
        parsed = JSON.parse(queryInput);
      }
      const res = await executeMongoQuery(activeCollection, 'find', parsed);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({ error: err.message || 'Invalid JSON query format' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-full max-w-4xl bg-stone-950 text-stone-100 rounded-xl shadow-2xl border border-stone-800 overflow-hidden my-4 flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-md">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-stone-100">
                  MongoDB Studio & Shell
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 rounded">
                  Connected: aura_living_db
                </span>
              </div>
              <p className="text-[11px] font-mono text-stone-400">
                Node.js Express Document Engine · 24-char BSON ObjectIDs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 transition-colors disabled:opacity-50"
              title="Reset collections to seed state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Seed</span>
            </button>
            <button
              onClick={loadStatsAndDocs}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
              title="Refresh collections"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collections Toolbar */}
        <div className="px-5 py-2.5 bg-stone-900/60 border-b border-stone-800 flex items-center justify-between text-xs font-mono overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-[11px] uppercase tracking-wider">Collections:</span>
            {['products', 'orders', 'categories', 'reviews'].map((col) => (
              <button
                key={col}
                onClick={() => {
                  setActiveCollection(col);
                  setQueryResult(null);
                }}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeCollection === col
                    ? 'bg-emerald-600 text-stone-950 font-semibold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{col}</span>
                <span className="text-[10px] opacity-75 tabular-nums">
                  ({stats?.collections?.[col]?.count ?? '·'})
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-2.5 py-1 rounded ${activeTab === 'documents' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Documents View
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`px-2.5 py-1 rounded ${activeTab === 'query' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Query Console
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs">
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <span>
                  Query executed: <span className="text-emerald-400">db.{activeCollection}.find()</span>
                </span>
                <span>{collectionDocs.length} documents retrieved</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-stone-500">Querying MongoDB collection...</div>
              ) : collectionDocs.length === 0 ? (
                <div className="py-12 text-center text-stone-500">Collection is empty.</div>
              ) : (
                <div className="space-y-3">
                  {collectionDocs.map((doc, idx) => (
                    <div
                      key={doc._id || idx}
                      className="p-3.5 bg-stone-900 rounded-lg border border-stone-800 text-stone-300 leading-relaxed overflow-x-auto hover:border-stone-700 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400 text-[11px]">
                        <span className="text-emerald-400 font-semibold">
                          _id: ObjectId("{doc._id}")
                        </span>
                        {doc.createdAt && (
                          <span className="text-stone-500">
                            timestamp: {new Date(doc.createdAt).toISOString()}
                          </span>
                        )}
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap text-stone-300">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'query' && (
            <div className="space-y-4">
              <div>
                <label className="block text-stone-400 text-[11px] mb-1">
                  Run MongoDB Selector Filter on <span className="text-emerald-400">db.{activeCollection}</span>:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder='{"price": {"$lte": 200}}'
                    className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded text-xs text-stone-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleRunQuery}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold rounded text-xs transition-colors"
                  >
                    Run Query
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-500">
                Examples: <code className="text-stone-300">{'{"price": {"$gte": 500}}'}</code> or <code className="text-stone-300">{'{"category": "lighting"}'}</code>
              </div>

              {queryResult && (
                <div className="p-4 bg-stone-900 rounded-lg border border-stone-800">
                  <div className="text-stone-400 text-[11px] mb-2 font-semibold flex items-center justify-between">
                    <span>Query Output:</span>
                    <span>{Array.isArray(queryResult) ? `${queryResult.length} matches` : 'Result'}</span>
                  </div>
                  <pre className="text-[11px] whitespace-pre-wrap text-emerald-300 max-h-80 overflow-y-auto">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-5 py-2.5 bg-stone-900 border-t border-stone-800 text-[11px] font-mono text-stone-400 flex items-center justify-between">
          <span>Engine: MongoDB Embedded Document Model 7.0.5</span>
          <span>Storage: data/mongodb_data.json</span>
        </div>
      </div>
    </div>
  );
};
