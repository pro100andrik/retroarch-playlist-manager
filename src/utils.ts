import fs from 'fs'
import path from 'path'
import { CORES, DATABASES } from './retroArchVariables'
import crc32 from 'crc/crc32';
import { PlaylistsType, filePathParsed } from './TSTypes';

export const coresSortTypes = {
  default: 0,
  az: 1,
  installed: 2,
}

export function getSortedCores(cores: (string | boolean)[][], sortType: number ){
  let sortedCores = <(string | boolean)[][]>[];
  if (sortType === 0){
    sortedCores = cores
  }
  if (sortType === 1){
    sortedCores = cores
  }
  if (sortType === 2){
    sortedCores = cores.sort((coreA, coreB) => coreA[2] === coreB[2] ? ((typeof coreA[1] === 'string' && typeof coreB[1] === 'string') ? coreA[1].localeCompare(coreB[1]) : 0) : coreA[2] ? -1 : 1)
  }
  return [["DETECT", "DETECT", true] , ...sortedCores]
}

export const coresFilterTypes = {
  all: 0,
  installed: 1,
}

export function getFilteredCores(cores: any[][], filterType: number){
  return filterType === 0 ? cores : cores.filter(core => core[2])
}


export function getPlaylists(folderPath: string){
  console.log('render getPlaylists')
  if (fs.existsSync(folderPath)){
    return fs.readdirSync(folderPath).filter(fileName => path.extname(fileName).includes('lpl'))
    .map(fileName => Object.assign({}, path.parse(path.join(folderPath, fileName)), {"path": path.join(folderPath, fileName)} ))
  } 
  return []
}

export function createEmptyPlaylist(path: string){
  fs.writeFileSync(path, '')
}

export function renamePlaylist(oldFile: PlaylistsType, newFileName: string){ 
  const newFilePath = path.join(oldFile.dir, newFileName + oldFile.ext)
  fs.renameSync(oldFile.path, newFilePath)
}

export function getPlaylistJSON(pathToPlaylist: string){
  console.log('render getPlaylistJSON')
  return JSON.parse(fs.readFileSync(pathToPlaylist, 'utf8'))
}

export function writePlaylistToDrive(playlistPath: string, data: object){
  fs.writeFileSync(playlistPath, JSON.stringify(data, null, 2))
}

export function getNameFromPath(targetPath: string){
  return path.parse(targetPath).name
}

export function getCoreIndex(corePath: string, cores: (string | boolean)[][]){
  return cores.findIndex(core => core[0] === getNameFromPath(corePath)) >= 0 ? cores.findIndex(core => core[0] === getNameFromPath(corePath)) : 0;
  return Object.keys(CORES).findIndex((coreName) => coreName === getNameFromPath(corePath)) >= 0 ? Object.keys(CORES).findIndex((coreName) => coreName === getNameFromPath(corePath)) : 0;
}

export function getCoresListWithInstalled(corePath: string, coresArray: [string, string][]){
  console.log('render getCoresListWithInstalled')
  const installedCoresNames = fs.readdirSync(corePath)
  .filter(coreName => coreName.includes('.dll'))
  .map(coreName => coreName.replace('.dll', ''))
  return coresArray.map(core => [...core, installedCoresNames.includes(core[0])])
}

export function getROMsObjectsFromPaths(targetPaths: string[]){
  // TODO: add zip reading ability
  return targetPaths.map(filePath => ({
    "path": filePath, // The path to the ROM
    "label": getNameFromPath(filePath), // displayed name in list
    "core_path": "DETECT", // The path to the core, this libretro core will be used to launch the ROM, example E:\\Games\\SteamLibrary\\steamapps\\common\\RetroArch\\cores\\fceumm_libretro.dll
    "core_name": "DETECT", //The displayname of the core, not really useful, we keep it there because the history list is also using this format
    "crc32": getCrc(filePath), // CRC or Serial number for database and other matching purposes. You can omit the CRC or Serial for a manually created playlist entry by using the word DETECT 
    "db_name": getDbNameFromROMExtension(path.extname(filePath).replace('.','')) // The name of the system playlist to which this ROM is associated for looking up database metadata and thumbnails
  })) 
}

export function getCrc(filePath: string){
  let crc = crc32(fs.readFileSync(filePath)).toString(16).toUpperCase();
  if (crc.length < 8){
    crc = ('00000000' + crc).slice(-8)
  }
  return crc + '|crc'
}

export function getDbNameFromROMExtension(extension: string){
  for (const db of DATABASES){
    if (db[1].includes(extension))
    return db[0]
  }
  return "DETECT"
}

export function writeConfigToDrive(configPath: string, config: Object){
  return fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

export function getConfigFromDrive(configPath: string){
  if (fs.existsSync(configPath)){
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }
  return null
}
