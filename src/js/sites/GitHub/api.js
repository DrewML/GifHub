function getMarkdownPreview(text) {
    return fetch('https://api.github.com/markdown', {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json",
            "Accept": "application/vnd.github.v3+json",
        },
        body : JSON.stringify({
            mode: 'markdown',
            text
        }),
    }).then(res => res.text())
}

export function bypassCSPForImages(images = []) {
    const markdown = images.map(image => (
        `![${image.name}](${image.uri}) ![downsized](${image.downsizedUri})`
    )).join('\n\n');

    return getMarkdownPreview(markdown).then(res => {
      const $res = $(res);
      return Array.from($res.filter('p')).map(p => {
        const imgs = $(p).find('img');
        return {
          uri: imgs.get(0).src,
          name: imgs.get(0).alt,
          downsizedUri: imgs.get(1).src
        };
      });
    });
}
