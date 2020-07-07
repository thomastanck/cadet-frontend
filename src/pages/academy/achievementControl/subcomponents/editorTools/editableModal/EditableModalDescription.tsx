import React from 'react';
import { EditableText } from '@blueprintjs/core';

type EditableModalDescriptionProps = {
  description: string;
  setDescription: any;
};

function EditableModalDescription(props: EditableModalDescriptionProps) {
  const { description, setDescription } = props;

  return (
    <>
      <h3>
        <EditableText
          placeholder={`Enter your description here`}
          value={description}
          onChange={setDescription}
          multiline={true}
        />
      </h3>
    </>
  );
}

export default EditableModalDescription;