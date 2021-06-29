import { Logger, LogLevel } from "@pnp/logging";
import { IWeb } from "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import "@pnp/sp/site-groups";
import "@pnp/sp/security";

import { CustomListNames } from "../models/Enums";
import { params } from "./Parameters";

export interface IConfigService {
  validatePlaylists(owner: boolean): Promise<boolean>;
  validateAssets(owner: boolean): Promise<boolean>;
  validateConfig(owner: boolean): Promise<boolean>;
}

export class ConfigService implements IConfigService {
  private LOG_SOURCE: string = "ConfigService";
  private _learningWeb: IWeb;

  constructor(learningWeb: IWeb) {
    this._learningWeb = learningWeb;
  }

  public async validatePlaylists(owner: boolean): Promise<boolean> {
    try {
      let playlistCheck = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.select("Title").filter("Title eq 'JSONData'").get<{ Title: string }[]>();
      let playlistCheckCDN = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.select("Title").filter("Title eq 'CDN'").get<{ Title: string }[]>();
      if (playlistCheck.length !== 1 || playlistCheckCDN.length !== 1) {
        if (owner) {
          try {
            //List exists, field doesn't
            if (playlistCheck.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).defaultView;
              await view.fields.add("JSONData");
              Logger.write(`Adding JSONData field - ${this.LOG_SOURCE} (validatePlaylists)`, LogLevel.Warning);
            }
            if (playlistCheckCDN.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).defaultView;
              await view.fields.add("CDN");
              Logger.write(`Adding CDN field - ${this.LOG_SOURCE} (validatePlaylists)`, LogLevel.Warning);
              //Set all existing entries to "Default"
              let playlists = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).items.top(5000).select("Id").get<{ Id: string }[]>();
              for (let i = 0; i < playlists.length; i++) {
                await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+playlists[i].Id).update({ CDN: 'Default' });
              }
            }
          } catch (err) {
            Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validatePlaylists) - ${err}`, LogLevel.Error);
            return false;
          }
        } else {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validatePlaylists) -- User does not have appropriate rights to create field in custom playlists list.`, LogLevel.Error);
          return false;
        }
      }
    } catch (err) {
      //Assume list doesn't exist
      if (owner) {
        try {
          await this._learningWeb.lists.add(CustomListNames.customPlaylistsName, "Microsoft Custom Learning - Custom Playlists", 100, true);
          await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
          await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
          let view = await this._learningWeb.lists.getByTitle(CustomListNames.customPlaylistsName).defaultView;
          await view.fields.add("JSONData");
          await view.fields.add("CDN");
        } catch (err) {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validatePlaylists) - ${err} - `, LogLevel.Error);
          return false;
        }
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validatePlaylists) -- User does not have appropriate rights to create custom playlists list.`, LogLevel.Error);
        return false;
      }
    }
    return true;
  }

  public async validateAssets(owner: boolean): Promise<boolean> {
    try {
      let assetsCheck = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.select("Title").filter("Title eq 'JSONData'").get<{ Title: string }[]>();
      let assetsCheckCDN = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.select("Title").filter("Title eq 'CDN'").get<{ Title: string }[]>();
      if (assetsCheck.length !== 1 || assetsCheckCDN.length !== 1) {
        if (owner) {
          try {
            //List exists, field doesn't
            if (assetsCheck.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).defaultView;
              await view.fields.add("JSONData");
              Logger.write(`Adding JSONData field - ${this.LOG_SOURCE} (validateAssets)`, LogLevel.Warning);
            }
            if (assetsCheckCDN.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).defaultView;
              await view.fields.add("CDN");
              Logger.write(`Adding CDN field - ${this.LOG_SOURCE} (validateAssets)`, LogLevel.Warning);
              //Set all existing entries to "Default"
              let assets = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).items.top(5000).select("Id").get<{ Id: string }[]>();
              for (let i = 0; i < assets.length; i++) {
                await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).items.getById(+assets[i].Id).update({ CDN: 'Default' });
              }
            }
          } catch (err) {
            Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateAssets) - ${err} - `, LogLevel.Error);
            return false;
          }
        } else {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateAssets) -- User does not have appropriate rights to create field in custom assets list.`, LogLevel.Error);
          return false;
        }
      }
    } catch (err) {
      //Assume list doesn't exist
      if (owner) {
        try {
          await this._learningWeb.lists.add(CustomListNames.customAssetsName, "Microsoft Custom Learning - Custom Assets", 100, true);
          await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
          await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
          let view = await this._learningWeb.lists.getByTitle(CustomListNames.customAssetsName).defaultView;
          await view.fields.add("JSONData");
          await view.fields.add("CDN");
        } catch (err) {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateAssets) - ${err} - `, LogLevel.Error);
          return false;
        }
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateAssets) -- User does not have appropriate rights to create custom assets list.`, LogLevel.Error);
        return false;
      }
    }
    return true;
  }

  private async getRoleInformation(): Promise<number[]> {
    let retVal: number[] = [];
    try {
      let targetGroup = await this._learningWeb.associatedVisitorGroup();
      let targetGroupId = targetGroup.Id;
      let roleDefinition = await this._learningWeb.roleDefinitions.getByType(3).get();
      let roleDefinitionId = roleDefinition.Id;
      retVal.push(targetGroupId);
      retVal.push(roleDefinitionId);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getRoleInformation) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public async validateConfig(owner: boolean): Promise<boolean> {
    try {
      let configCheck = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.select("Title").filter("Title eq 'JSONData'").get<{ Title: string }[]>();
      let configCheckCDN = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.select("Title").filter("Title eq 'CDN'").get<{ Title: string }[]>();
      let configCheckLanguage = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.select("Title").filter("Title eq 'Language'").get<{ Title: string }[]>();
      if (configCheck.length !== 1 || configCheckCDN.length !== 1 || configCheckLanguage.length !== 1) {
        if (owner) {
          try {
            //List exists, field doesn't
            if (configCheck.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).defaultView;
              await view.fields.add("JSONData");
              Logger.write(`Adding JSONData field - ${this.LOG_SOURCE} (validateConfig)`, LogLevel.Warning);
            }
            if (configCheckCDN.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).defaultView;
              await view.fields.add("CDN");
              Logger.write(`Adding CDN field - ${this.LOG_SOURCE} (validateConfig)`, LogLevel.Warning);
              //Set all existing entries to "Default"
              let configs = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).items.top(5000).select("Id").get<{ Id: string }[]>();
              for (let i = 0; i < configs.length; i++) {
                await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).items.getById(+configs[i].Id).update({ CDN: 'Default' });
              }
            }
            if (configCheckLanguage.length !== 1) {
              await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("Language", "SP.Field", { "FieldTypeKind": 2 });
              let view = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).defaultView;
              await view.fields.add("Language");
              Logger.write(`Adding Language field - ${this.LOG_SOURCE} (validateConfig)`, LogLevel.Warning);
              //Set all existing entries to default language
              let configs = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).items.top(5000).select("Id", "Title").get<{ Id: string, Title: string }[]>();
              for (let i = 0; i < configs.length; i++) {
                if (configs[i].Title === "CustomConfig") {
                  await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).items.getById(+configs[i].Id).update({ Language: params.defaultLanguage });
                }
              }
            }
          } catch (err) {
            Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateConfig) - ${err}`, LogLevel.Error);
            return false;
          }
        } else {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateConfig) -- User does not have appropriate rights to create field in custom config list.`, LogLevel.Error);
          return false;
        }
      }
    } catch (err) {
      //Assume list doesn't exist
      if (owner) {
        try {
          await this._learningWeb.lists.add(CustomListNames.customConfigName, "Microsoft Custom Learning - Custom Config", 100, true);
          await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("JSONData", "SP.Field", { "FieldTypeKind": 3 });
          await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("CDN", "SP.Field", { "FieldTypeKind": 2 });
          await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).fields.add("Language", "SP.Field", { "FieldTypeKind": 2 });
          let view = await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).defaultView;
          await view.fields.add("JSONData");
          await view.fields.add("CDN");
          await view.fields.add("Language");
          await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).breakRoleInheritance(true);
          let configPermissions = await this.getRoleInformation();
          if (configPermissions.length > 0) {
            await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).roleAssignments.getById(configPermissions[0]).delete();
            await this._learningWeb.lists.getByTitle(CustomListNames.customConfigName).roleAssignments.add(configPermissions[0], configPermissions[1]);
          } else {
            Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateConfig) - ${CustomListNames.customConfigName} list created but permissions could not be set.`, LogLevel.Error);
            return false;
          }
        } catch (err) {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateConfig) - ${err}`, LogLevel.Error);
          return false;
        }
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateConfig) -- User does not have appropriate rights to create custom config list.`, LogLevel.Error);
        return false;
      }
    }
    return true;
  }
}