import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../stores';
import Icon from '../components/common/Icon';

const RATING_COLORS = ['', '#FF3B30', '#FF9F0A', '#FFCC00', '#34C759', '#007AFF'];
const RATING_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export default function StatsPage() {
  const images = useStore(s => s.images);
  const [freq, setFreq] = useState([]);
  const [tagged, setTagged] = useState(0);
  const [ratingDist, setRatingDist] = useState([]);

  useEffect(() => { load(); }, [images]);

  async function load() {
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
        color: RATING_COLORS[d.rating] || '#007AFF',
      })));
    }
  }

  const pct = images.length ? Math.round((tagged / images.length) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface-100">
      <h2 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2">
        <Icon name="chart" size={22} /> 统计
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: '总图片', val: images.length, color: 'text-accent-500' },
          { label: '已分类', val: tagged, color: 'text-ios-green' },
          { label: '完成度', val: `${pct}%`, color: 'text-ios-orange' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-ios border border-surface-200">
            <div className={`text-3xl font-bold ${c.color}`}>{c.val}</div>
            <div className="text-sm text-surface-800 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="h-2 bg-surface-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-500 to-ios-green rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {freq.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-ios border border-surface-200">
            <h3 className="text-base font-semibold text-surface-900 mb-4">标签使用频率</h3>
            <ResponsiveContainer width="100%" height={Math.max(300, freq.length * 28)}>
              <BarChart data={freq} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: 12, color: '#3A3A3C', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {freq.map((e, i) => <Cell key={i} fill={e.color || '#007AFF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {ratingDist.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-ios border border-surface-200">
            <h3 className="text-base font-semibold text-surface-900 mb-4">评分分布</h3>
            <ResponsiveContainer width="100%" height={Math.max(250, ratingDist.length * 50)}>
              <BarChart data={ratingDist} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 14 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: 12, color: '#3A3A3C', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ratingDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {freq.length === 0 && ratingDist.length === 0 && (
        <div className="text-center text-surface-700 py-12">暂无统计数据，请先导入图片并为其添加标签或评分</div>
      )}
    </div>
  );
}
