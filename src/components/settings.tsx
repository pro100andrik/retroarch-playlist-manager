import { View, Text, LineEdit, Button, useEventHandler, ScrollArea, CheckBox } from "@nodegui/react-nodegui";
import { QPushButtonSignals, QMouseEvent, QButtonGroupSignals } from "@nodegui/nodegui";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { RComboBox } from "./RComboBox";
const _ = require('lodash');
import { appConfig } from "../TSTypes";

 
export default function Settings(props: {appConfig: appConfig, setAppConfig: Function, setShowSettings: Function}){

  const [appConfig, setAppConfig] = useState(_.cloneDeep(props.appConfig))

  const handleSettingsChange = (key: string, value: boolean | number) => {
    setAppConfig((prevState: appConfig) => {
      const newConfig = Object.assign({}, prevState, {[key]: value })
      return _.cloneDeep(newConfig)
    })
  }

  return (
    <View id="settings-wrapper">
      <Text>Settings</Text>
      <CheckBox text={"Show advanced ROM fields"} checked={appConfig.advancedRomFields} on={{ clicked(checked) { handleSettingsChange('advancedRomFields', checked ) },}} />
      {appConfig.advancedRomFields && <Text>Causes lags in big playlists</Text>}

      <CheckBox text={"Hide non installed cores from dropdown list"} checked={appConfig.hideNonInstalledCores} on={{ clicked(checked) { handleSettingsChange('hideNonInstalledCores', checked ) },}} />
      {!appConfig.hideNonInstalledCores && <Text>Causes lags in big playlists</Text>}

      

      <RComboBox 
        label="Cores Filter Type"
        items={[{text: "Show all"}, {text: "Only installed"}]}
        currentIndexSetter={handleSettingsChange}
        initialIndex={appConfig.coresFilterType}
        keyInObject="coresFilterType"
      />

      <RComboBox 
        label="Cores Sort Type"
        items={[{text: "Default"}, {text: "Alphabetical"}, {text: "Installed first"}]}
        currentIndexSetter={handleSettingsChange}
        initialIndex={appConfig.coresSortType}
        keyInObject="coresSortType"
      />


      <Button 
        text="Save" 
        on={{clicked: () => {
          props.setAppConfig(_.cloneDeep(appConfig))
          props.setShowSettings(false)
        }}} 
      />

      <Button 
        text="Cancel" 
        on={{clicked: () => {
          props.setShowSettings(false)
        }}} 
      />
      
    </View>
  )

}