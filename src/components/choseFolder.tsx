import { View, Button, useEventHandler } from "@nodegui/react-nodegui";
import { QPushButtonSignals, QFileDialog } from "@nodegui/nodegui";
import React from "react";

export function ChoseFolder(props: {chosenFolder: string, setChosenFolder: Function, defaultText?: string}) {
  const chooseFolderButtonHandler = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {
        const fileDialog = new QFileDialog();
        fileDialog.setFileMode(2);
        fileDialog.setLabelText(3, 'Choose playlist folder')
        fileDialog.exec();
        const selectedFolder = fileDialog.selectedFiles();
        if (fileDialog.result() !== 0) props.setChosenFolder(selectedFolder[0])
      }
    },
    []
  );
  return (
    <Button
      style={btnStyle}
      on={chooseFolderButtonHandler}
      text={props.chosenFolder.length > 0 ? props.chosenFolder : props.defaultText ? props.defaultText : 'Chose folder'}
    />
  );
}

const btnStyle = `
  margin-horizontal: 20px;
  height: 30px;
`;
