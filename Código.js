function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Biblioteca de Prompts')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}