export function extractInitialPlayerResponse(html: string): any {
  const marker = 'ytInitialPlayerResponse = ';
  const startIndex = html.indexOf(marker);
  if (startIndex < 0) {
    throw new Error('ytInitialPlayerResponse not found in HTML');
  }

  const jsonStart = startIndex + marker.length;

  const scriptEndIndex = html.indexOf('</script>', jsonStart);
  if (scriptEndIndex < 0) {
    throw new Error('Closing </script> tag not found after ytInitialPlayerResponse');
  }

  const jsonEndIndex = html.lastIndexOf('};', scriptEndIndex);
  if (jsonEndIndex < 0) {
    throw new Error('Closing brace "};" not found for ytInitialPlayerResponse JSON');
  }

  const jsonString = html.slice(jsonStart, jsonEndIndex + 1);

  try {
    return JSON.parse(jsonString);
  }
  catch (err) {
    throw new Error(`Failed to parse ytInitialPlayerResponse JSON: ${err.message}`);
  }
}
