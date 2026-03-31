module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const key = process.env.NOTION_KEY;
  const rootId = process.env.NOTION_PAGE;
  if (!key || !rootId) return res.status(500).json({error: 'Missing env vars'});

  const h = {
    'Authorization': `Bearer ${key}`,
    'Notion-Version': '2022-06-28'
  };

  try {
    const r = await fetch(`https://api.notion.com/v1/blocks/${rootId}/children?page_size=100`, {headers: h});
    const d = await r.json();
    const blocks = d.results || [];
    const types = blocks.map(b => ({type: b.type, id: b.id}));
    res.status(200).json({count: blocks.length, types, raw: blocks.slice(0,3)});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
