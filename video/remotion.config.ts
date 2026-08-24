import { Config } from "@remotion/cli/config";

// Por padrao o Remotion baixa o proprio Chrome Headless Shell. Em ambientes sem
// acesso a remotion.media (ex.: este container), aponte um Chromium ja instalado:
//   REMOTION_BROWSER_EXECUTABLE=/caminho/para/headless_shell
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Reels/Stories saem em 1080x1920. Qualidade alta pro Meta nao esmagar o video.
Config.setCrf(18);
