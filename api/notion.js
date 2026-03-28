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
    const r = await fetch(`https://api.notion.com/v1/blocks/${id}/children`, {headers});
    const d = await r.json();
    return d.results || [];
  }
  try {
    const rootBlocks = await getBlocks(pageId);
    const result = [];
    for (const block of rootBlocks) {
      result.push(block);
      if (block.type === 'child_page') {
        const subBlocks = await getBlocks(block.id);
        result.push({type:'_subpage_title', _title: block.child_page?.title || 'Sans titre', id: block.id});
        result.push(...subBlocks);
        result.push({type:'divider', id:'div-'+block.id});
      }
    }
    res.status(200).json({results: result});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
