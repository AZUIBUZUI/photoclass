// ============================================================
// PhotoClass 默认分类体系 & 快捷键
// 新建项目时自动写入数据库
// ============================================================

// 分类维度 + 标签（快捷键存入 tag 表）
export const DEFAULT_DIMENSIONS = [
  {
    name: '构图', color: '#8b5cf6', sort_order: 0, is_multiselect: 1, is_rating: 0,
    tags: [
      '三分法', '对称', '引导线', '框架', '留白', '对角线', '中心', '散点',
    ],
    keys: ['Ctrl+1','Ctrl+2','Ctrl+3','Ctrl+4','Ctrl+5','Ctrl+6','Ctrl+7','Ctrl+8'],
  },
  {
    name: '光影', color: '#f59e0b', sort_order: 1, is_multiselect: 1, is_rating: 0,
    tags: [
      '顺光', '侧光', '逆光', '柔光', '硬光', '剪影', '低调', '高调',
    ],
    keys: ['Alt+1','Alt+2','Alt+3','Alt+4','Alt+5','Alt+6','Alt+7','Alt+8'],
  },
  {
    name: '情绪', color: '#06b6d4', sort_order: 2, is_multiselect: 1, is_rating: 0,
    tags: [
      '宁静', '热烈', '忧郁', '神秘', '欢快', '庄重', '孤独', '温暖',
    ],
    keys: ['Ctrl+Shift+1','Ctrl+Shift+2','Ctrl+Shift+3','Ctrl+Shift+4','Ctrl+Shift+5','Ctrl+Shift+6','Ctrl+Shift+7','Ctrl+Shift+8'],
  },
];

// 评分维度（不设快捷键，评分用 shortcut_binding 中的独立键位）
export const RATING_DIMENSION = {
  name: '评分', color: '#ef4444', sort_order: 99, is_multiselect: 0, is_rating: 1,
  tags: ['1星','2星','3星','4星','5星'],
};

// 应用级快捷键（存入 shortcut_binding 表）
// 这些键位优先级高于标签快捷键，数字键 1-5 留给评分
export const DEFAULT_SHORTCUTS = {
  // 导航
  'nav.next':     'ArrowRight',
  'nav.prev':     'ArrowLeft',
  'nav.first':    'Home',
  'nav.last':     'End',
  // 查看器
  'viewer.zoomIn':  'Ctrl+=',
  'viewer.zoomOut': 'Ctrl+-',
  'viewer.zoomFit': 'Ctrl+0',
  'viewer.fullscreen': 'F',
  // 评分 — 数字键直接打分
  'tag.rate.1': '1',
  'tag.rate.2': '2',
  'tag.rate.3': '3',
  'tag.rate.4': '4',
  'tag.rate.5': '5',
  'tag.clearRating': '0',
  'tag.favorite': '`',
  // 应用
  'app.import':      'Ctrl+I',
  'app.deleteImage': 'Delete',
};
