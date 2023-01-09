async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}
