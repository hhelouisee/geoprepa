module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const pageId = process.env.NOTION_PAGE;
  const key = process.env.NOTION_KEY;
  if (!pageId || !key) return res.status(500).json({error: 'Missing env vars'});
  
  const headers = {
    'Authorization': `Bearer ${key}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  async function getBlocks(id) {
    const r = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {headers});
    const d = await r.json();
    return d.results || [];
  }

  async function loadPage(id, title, depth) {
    if (depth > 3) return [];
    const blocks = await getBlocks(id);
    const result = [];
    if (title) result.push({type: '_subpage_title', _title: title, id});
    for (const block of blocks) {
      if (block.type === 'child_page') {
        const sub = await loadPage(block.id, block.child_page?.title || 'Sans titre', depth + 1);
        result.push(...sub);
      } else {
        result.push(block);
      }
    }
    if (title) result.push({type: 'divider', id: 'div-' + id});
    return result;
  }

  try {
    const results = await loadPage(pageId, null, 0);
    res.status(200).json({results});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
