import { View, Button, useEventHandler } from "@nodegui/react-nodegui";
import { QPushButtonSignals, QFileDialog } from "@nodegui/nodegui";
import React from "react";


export function ChoseROMs(props: {setChosenFiles: Function}) {
  const chooseFolderButtonHandler = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {
        const fileDialog = new QFileDialog();
        fileDialog.setFileMode(3);
        fileDialog.setLabelText(3, 'Choose ROMs')
        fileDialog.setNameFilter('ROMs (*.*)'); 
        fileDialog.exec();
        const selectedFiles = fileDialog.selectedFiles();
        if (fileDialog.result() !== 0) props.setChosenFiles(selectedFiles)
      }
    },
    []
  );
  return (
    <Button
      style={btnStyle}
      on={chooseFolderButtonHandler}
      text={'Add ROMs'}
    />
  );
}

const btnStyle = `
  margin-horizontal: 20px;
  height: 30px;
`;
