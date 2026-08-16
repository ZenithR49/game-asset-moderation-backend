const response = await fetch("http://localhost:3000/assets", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    assetId: "summer-raid-001",
    prompt: "A bright isometric island arena for a summer raid event",
    liveEventId: "summer-raid"
  })
});

console.log(await response.json());
