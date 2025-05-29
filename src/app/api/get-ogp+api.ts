import ogs from 'open-graph-scraper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
    });
  }

  const { error, result } = await ogs({ url });

  if (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
