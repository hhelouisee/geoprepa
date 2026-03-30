module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const key = process.env.NOTION_KEY;
  const rootId = process.env.NOTION_PAGE;
  if (!key || !rootId) return res.status(500).json({error: 'Missing env vars'});

  const h = {
    'Authorization': `Bearer ${key}`,
    'Notion-Version': '2022-06-28'
  };

  async function getChildren(id) {
    try {
      const r = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {headers: h});
      const d = await r.json();
      return d.results || [];
    } catch(e) { return []; }
  }

  async function collectAll(id, title, depth) {
    if (depth > 4) return [];
    const out = [];
    if (title) out.push({type: '_subpage_title', _title: title});
    const blocks = await getChildren(id);
    for (const b of blocks) {
      if (b.type === 'child_page') {
        const sub = await collectAll(b.id, b.child_page?.title || 'Page', depth + 1);
        out.push(...sub);
      } else {
        out.push(b);
      }
    }
    if (title && blocks.length > 0) out.push({type: 'divider'});
    return out;
  }

  try {
    const results = await collectAll(rootId, null, 0);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({results, count: results.length});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
