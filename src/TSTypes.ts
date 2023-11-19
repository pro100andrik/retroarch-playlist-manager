import { QIcon, QVariant } from "@nodegui/nodegui";

export type PlaylistsType = {
  dir: string;
  root: string;
  base: string;
  name: string;
  ext: string;
  path: string;
};

export type PlaylistData = {
  "version": string;
  "default_core_path": string;
  "default_core_name": string;
  "label_display_mode": number;
  "right_thumbnail_mode": number;
  "left_thumbnail_mode": number;
  "sort_mode":  number;
  "items": ROMData[];
};

export type ROMData = {
  "path": string;
  "label": string;
  "core_path": string;
  "core_name": string;
  "crc32": string;
  "db_name": string;
  [key: string]: string | number;
};

export type appConfig = {
  advancedRomFields: boolean;
  hideNonInstalledCores: boolean;
  coresFilterType: number;
  coresSortType: number;
  windowGeometry: {
    windowSize: {
      width: number;
      height: number;
    },
    windowPosition: {
      x: number;
      y: number;
    }
  }
};

export type ComboBoxItem = {
  text: string;
  icon?: QIcon;
  userData?: QVariant;
};

export type filePathParsed = {
  dir: string;
  root: string;
  base: string;
  name: string;
  ext: string;
  path: string;
}