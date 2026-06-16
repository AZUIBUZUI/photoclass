import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../stores';

const RATING_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const RATING_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export default function StatsPage() {
  const images = useStore(s => s.images);
  const [freq, setFreq] = useState([]);
  const [tagged, setTagged] = useState(0);
  const [ratingDist, setRatingDist] = useState([]);

  useEffect(() => { load(); }, [images]);

  async function load() {
    // One-time sync: link existing ratings to rating dimension tags
    await window.api.invoke('stats:syncRatingTags');

    const [f, p, r] = await Promise.all([
      window.api.invoke('stats:tagFrequency'),
      window.api.invoke('stats:taggingProgress'),
      window.api.invoke('stats:ratingDistribution'),
    ]);
    if (f.data) setFreq(f.data);
    if (p.data) setTagged(p.data.tagged);
    if (r.data) {
      setRatingDist(r.data.map(d => ({
        ...d,
        name: RATING_LABELS[d.rating] || `${d.rating}星`,
        color: RATING_COLORS[d.rating] || '#8b5cf6',
      })));
    }
  }

  const pct = images.length ? Math.round((tagged / images.length) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface-950">
      <h2 className="text-xl font-bold text-slate-100 mb-6">📊 统计</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: '总图片', val: images.length, color: 'text-accent-400' },
          { label: '已分类', val: tagged, color: 'text-emerald-400' },
          { label: '完成度', val: `${pct}%`, color: 'text-amber-400' },
        ].map(c => (
          <div key={c.label} className="bg-surface-900 rounded-xl p-5 border border-surface-800">
            <div className={`text-3xl font-bold ${c.color}`}>{c.val}</div>
            <div className="text-sm text-slate-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="h-2 bg-surface-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {freq.length > 0 && (
          <div className="bg-surface-900 rounded-xl p-5 border border-surface-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">标签使用频率</h3>
            <ResponsiveContainer width="100%" height={Math.max(300, freq.length * 28)}>
              <BarChart data={freq} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 6, color: '#e2e8f0' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {freq.map((e, i) => <Cell key={i} fill={e.color || '#8b5cf6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {ratingDist.length > 0 && (
          <div className="bg-surface-900 rounded-xl p-5 border border-surface-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">评分分布</h3>
            <ResponsiveContainer width="100%" height={Math.max(250, ratingDist.length * 50)}>
              <BarChart data={ratingDist} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 14 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 6, color: '#e2e8f0' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ratingDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {freq.length === 0 && ratingDist.length === 0 && (
        <div className="text-center text-slate-500 py-12">暂无统计数据，请先导入图片并为其添加标签或评分</div>
      )}
    </div>
  );
}
