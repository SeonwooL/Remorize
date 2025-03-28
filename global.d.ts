declare module "react-native-tesseract-ocr" {
    export default class TesseractOcr {
      static recognize(imagePath: string, lang: string): Promise<string>;
      static LANG_ENGLISH: string;
    }
  }
  