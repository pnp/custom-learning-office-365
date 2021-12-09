import '../extensions/String.extensions';

import * as _ from '@microsoft/sp-lodash-subset';

import * as strings from 'M365LPStrings';

export const IMG_SUPPORTED_EXTENSIONS = ".gif,.jpg,.jpeg,.bmp,.dib,.tif,.tiff,.ico,.png,.jxr,.svg";

/**
 * Helper with general methods to simplify some routines
 */
export class GeneralHelper {
  /**
   * Trims slash at the end of URL if needed
   * @param url URL
   */
  public static trimSlash(url: string): string {
    if (url.lastIndexOf('/') === url.length - 1)
      return url.slice(0, -1);
    return url;
  }

  /**
   * Encodes text
   * @param text text to encode
   */
  public static encodeText(text: string): string {
    const n = /[<>&'"\\]/g;
    return text ? text.replace(n, this._getEncodedChar) : '';
  }

  /**
   * Copy of Microsoft's GetLocalizedCountValue from SP.dateTimeUtil.
   * I've tried to rename all the vars to have meaningful names... but some were too unclear
   */
  public static getLocalizedCountValue(format: string, first: string, second: number): string {
    if (format == undefined || first == undefined || second == undefined)
      return null;
    let result: string = '';
    let a = -1;
    let firstOperandOptions: string[] = first.split('||');

    for (let firstOperandOptionsIdx = 0, firstOperandOptionsLen = firstOperandOptions.length; firstOperandOptionsIdx < firstOperandOptionsLen; firstOperandOptionsIdx++) {
      const firstOperandOption: string = firstOperandOptions[firstOperandOptionsIdx];

      if (firstOperandOption == null || firstOperandOption === '')
        continue;
      let optionParts: string[] = firstOperandOption.split(',');

      for (var optionPartsIdx = 0, optionPartsLen = optionParts.length; optionPartsIdx < optionPartsLen; optionPartsIdx++) {
        const optionPart: string = optionParts[optionPartsIdx];

        if (optionPart == null || optionPart === '')
          continue;
        if (isNaN(optionPart.parseNumberInvariant())) {
          const dashParts: string[] = optionPart.split('-');

          if (dashParts == null || dashParts.length !== 2)
            continue;
          var j, n;

          if (dashParts[0] === '')
            j = 0;
          else if (isNaN(dashParts[0].parseNumberInvariant()))
            continue;
          else
            j = parseInt(dashParts[0]);
          if (second >= j) {
            if (dashParts[1] === '') {
              a = firstOperandOptionsIdx;
              break;
            }
            else if (isNaN(dashParts[1].parseNumberInvariant()))
              continue;
            else
              n = parseInt(dashParts[1]);
            if (second <= n) {
              a = firstOperandOptionsIdx;
              break;
            }
          }
        }
        else {
          var p = parseInt(optionPart);

          if (second === p) {
            a = firstOperandOptionsIdx;
            break;
          }
        }
      }
      if (a !== -1)
        break;
    }
    if (a !== -1) {
      var e = format.split('||');

      if (e != null && e[a] != null && e[a] != '')
        result = e[a];
    }
    return result;
  }

  /**
   * Extracts text from HTML strings without creating HTML elements
   * @param html HTML string
   */
  public static getTextFromHTML(html: string): string {
    let result: string = html;
    let oldResult: string = result;
    const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

    const tagOrComment = new RegExp(
      '<(?:'
      // Comment body.
      + '!--(?:(?:-*[^->])*--+|-?)'
      // Special "raw text" elements whose content should be elided.
      + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
      + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
      // Regular name
      + '|/?[a-z]'
      + tagBody
      + ')>',
      'gi');

    do {
      oldResult = result;
      result = result.replace(tagOrComment, '');
    } while (result !== result);

    return result;
  }

  /**
   * Checks if value is defined (not null and not undefined)
   * @param value value
   */
  public static isDefined(value): boolean {
    return value != null;
  }

  /**
   * Creates Document element based on Xml string
   * @param xmlString XML string to parse
   */
  public static parseXml(xmlString): Document {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    return xml;
  }

  /**
   * Returns absoulute domain URL.
   * @param url
   */
  public static getAbsoluteDomainUrl(url: string): string {
    if (url !== undefined) {
      const myURL = new URL(url.toLowerCase());
      return myURL.protocol + "//" + myURL.host;
    } else {
      return undefined;
    }
  }

  public static formatBytes(bytes, decimals) {
    if (bytes == 0) {
      return strings.EmptyFileSize;
    }

    const k: number = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + strings.SizeUnit[i];
  }

  /**
   * Returns file name without extension.
   */
  public static getFileNameWithoutExtension(itemUrl: string) {
    const fileNameWithExtension = GeneralHelper.getFileNameFromUrl(itemUrl);
    const fileNameTokens = fileNameWithExtension.split(".");
    const fileName = fileNameTokens[0];

    return fileName;
  }

  /**
   * Returns file name with the extension
   */
  public static getFileNameFromUrl(itemUrl: string) {
    const urlTokens = itemUrl.split("?");
    const url = urlTokens[0];
    const tokens = url.split("/");
    const fileNameWithExtension = tokens[tokens.length - 1];

    return fileNameWithExtension;
  }

  public static isImage(fileName: string): boolean {
    const acceptableExtensions: string[] = IMG_SUPPORTED_EXTENSIONS.split(",");

    const thisExtension: string = GeneralHelper.getFileExtension(fileName);
    return acceptableExtensions.indexOf(thisExtension) > -1;
  }

  /**
   * Returns extension of the file
   */
  public static getFileExtension(fileName): string {

    // Split the URL on the dots
    const splitFileName = fileName.toLowerCase().split('.');

    // Take the last value
    let extensionValue = splitFileName.pop();

    // Check if there are query string params in place
    if (extensionValue.indexOf('?') !== -1) {
      // Split the string on the question mark and return the first part
      const querySplit = extensionValue.split('?');
      extensionValue = querySplit[0];
    }

    return `.${extensionValue}`;
  }

  private static _getEncodedChar(c): string {
    const o = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
      "\\": "&#92;"
    };
    return o[c];
  }
}
