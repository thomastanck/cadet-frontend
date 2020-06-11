/* tslint-disable no-unused-vars */
import { require as acequire, Ace /*, Range*/ } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import * as React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import { HotKeys } from 'react-hotkeys';

// import { createContext, getAllOccurrencesInScope } from 'js-slang';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import 'js-slang/dist/editors/ace/theme/source';
import { Variant } from 'js-slang/dist/types';

import { Documentation } from '../documentation/Documentation';
import { useMergedRef } from '../utils/Hooks';
import { AceMouseEvent, Position } from './EditorTypes';
import { defaultKeyBindings as keyBindings } from './EditorHotkeys';

import useHighlighting from './UseHighlighting';

// =============== Mixins ===============
/* import WithShareAce from './WithShareAce';
import WithHighlighting from './WithHighlighting';
import WithNavigation from './WithNavigation';
import WithTypeInference from './WithTypeInference';
export type Constructor<T> = new (...args: any[]) => T; */

export type EditorHooks = {
  onChange?: IAceEditorProps['onChange'];
  onCursorChange?: IAceEditorProps['onCursorChange'];
  hotkeys?: {
    evaluate?: () => void;
    highlightScope?: () => void;
  };
};

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export type EditorProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleReplValueChange?: (newCode: string) => void;
  handleReplEval?: () => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite?: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleSendReplInputToOutput?: (newOutput: string) => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
};

type StateProps = {
  breakpoints: string[];
  editorSessionId: string;
  editorValue: string;
  highlightedLines: number[][]; // FIXME type this better??
  isEditorAutorun: boolean;
  newCursorPosition?: Position;
  sharedbAceInitValue?: string;
  sharedbAceIsInviting?: boolean;
  sourceChapter?: number;
  externalLibraryName?: string;
  sourceVariant?: Variant;
};

const getMarkers = (highlightedLines: StateProps['highlightedLines']) => {
  const markerProps: IAceEditorProps['markers'] = [];
  for (const lineNum of highlightedLines) {
    markerProps.push({
      startRow: lineNum[0],
      startCol: 0,
      endRow: lineNum[1],
      endCol: 1,
      className: 'myMarker',
      type: 'fullLine'
    });
  }
  return markerProps;
};

const getModeString = (chapter: number, variant: Variant, library: string) =>
  'source' + chapter.toString() + variant + library;

/**
 * This _modifies global state_ and defines a new Ace mode globally.
 *
 * Don't call this directly in render functions!
 */
const selectMode = (chapter: number, variant: Variant, library: string) => {
  HighlightRulesSelector(chapter, variant, library, Documentation.externalLibraries[library]);
  ModeSelector(chapter, variant, library);
};

const makeHandleGutterClick = (
  handleEditorUpdateBreakpoints: DispatchProps['handleEditorUpdateBreakpoints']
) => (e: AceMouseEvent) => {
  const target = e.domEvent.target! as HTMLDivElement;
  if (
    target.className.indexOf('ace_gutter-cell') === -1 ||
    !e.editor.isFocused() ||
    e.clientX > 35 + target.getBoundingClientRect().left
  ) {
    return;
  }

  // Breakpoint related.
  const row = e.getDocumentPosition().row;
  const content = e.editor.session.getLine(row);
  const breakpoints = e.editor.session.getBreakpoints();
  if (
    breakpoints[row] === undefined &&
    content.length !== 0 &&
    !content.includes('//') &&
    !content.includes('debugger;')
  ) {
    e.editor.session.setBreakpoint(row, undefined!);
  } else {
    e.editor.session.clearBreakpoint(row);
  }
  e.stop();
  handleEditorUpdateBreakpoints(e.editor.session.getBreakpoints());
};

const makeHandleAnnotationChange = (session: any) => () => {
  const annotations = session.getAnnotations();
  let count = 0;
  for (const anno of annotations) {
    if (anno.type === 'info') {
      anno.type = 'error';
      anno.className = 'ace_error';
      count++;
    }
  }
  if (count !== 0) {
    session.setAnnotations(annotations);
  }
};

const makeCompleter = (handlePromptAutocomplete: DispatchProps['handlePromptAutocomplete']) => ({
  getCompletions: (editor: any, session: any, pos: any, prefix: any, callback: any) => {
    // Don't prompt if prefix starts with number
    if (prefix && /\d/.test(prefix.charAt(0))) {
      callback();
      return;
    }
    // console.log(pos); // Cursor col is insertion location i.e. last char col + 1
    handlePromptAutocomplete(pos.row + 1, pos.column, callback);
  }
});

const moveCursor = (editor: AceEditor['editor'], position: Position) => {
  editor.selection.clearSelection();
  editor.moveCursorToPosition(position);
  editor.renderer.showCursor();
  editor.renderer.scrollCursorIntoView(position, 0.5);
};

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

const EditorBase = React.forwardRef<AceEditor, EditorProps>(function EditorBase(
  props,
  forwardedRef
) {
  const reactAceRef: React.MutableRefObject<AceEditor | null> = React.useRef(null);

  const hooks = [
    { hotkeys: { evaluate: props.handleEditorEval } },
    useHighlighting(reactAceRef, props.editorValue, props.sourceChapter)
  ];

  const [sourceChapter, sourceVariant, externalLibraryName] = [
    props.sourceChapter || 1,
    props.sourceVariant || 'default',
    props.externalLibraryName || 'NONE'
  ];

  React.useEffect(() => {
    selectMode(sourceChapter, sourceVariant, externalLibraryName);
  }, [sourceChapter, sourceVariant, externalLibraryName]);

  React.useLayoutEffect(() => {
    if (!reactAceRef.current) {
      return;
    }
    const editor = reactAceRef.current.editor;
    const session = editor.getSession();

    // NOTE: the two `any`s below are because the Ace editor typedefs are
    // hopelessly incomplete
    editor.on(
      'gutterclick' as any,
      makeHandleGutterClick(props.handleEditorUpdateBreakpoints) as any
    );

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, makeHandleAnnotationChange(session));

    // Start autocompletion
    acequire('ace/ext/language_tools').setCompleters([
      makeCompleter(props.handlePromptAutocomplete)
    ]);
  }, [reactAceRef, props.handleEditorUpdateBreakpoints, props.handlePromptAutocomplete]);

  React.useLayoutEffect(() => {
    if (!reactAceRef.current) {
      return;
    }
    const newCursorPosition = props.newCursorPosition;
    if (newCursorPosition) {
      moveCursor(reactAceRef.current.editor, newCursorPosition);
    }
  }, [reactAceRef, props.newCursorPosition]);

  const {
    handleUpdateHasUnsavedChanges,
    handleEditorValueChange,
    isEditorAutorun,
    handleEditorEval
  } = props;
  const onChange = React.useCallback(
    (newCode: string, delta: Ace.Delta) => {
      if (!reactAceRef.current) {
        return;
      }
      if (handleUpdateHasUnsavedChanges) {
        handleUpdateHasUnsavedChanges(true);
      }
      handleEditorValueChange(newCode);
      const annotations = reactAceRef.current.editor.getSession().getAnnotations();
      if (isEditorAutorun && annotations.length === 0) {
        handleEditorEval();
      }
    },
    [
      reactAceRef,
      handleUpdateHasUnsavedChanges,
      handleEditorValueChange,
      handleEditorEval,
      isEditorAutorun
    ]
  );

  const commands = keyBindings.map(kb => ({
    ...kb,
    exec: () =>
      hooks.forEach(hook => {
        const fn = hook.hotkeys && hook.hotkeys[kb.name];
        if (fn) fn();
      })
  }));

  return (
    <HotKeys className="Editor" handlers={handlers}>
      <div className="row editor-react-ace">
        <AceEditor
          className="react-ace"
          commands={commands}
          editorProps={{
            $blockScrolling: Infinity
          }}
          ref={useMergedRef(reactAceRef, forwardedRef)}
          markers={React.useMemo(() => getMarkers(props.highlightedLines), [
            props.highlightedLines
          ])}
          fontSize={17}
          height="100%"
          highlightActiveLine={false}
          mode={getModeString(sourceChapter, sourceVariant, externalLibraryName)}
          theme="source"
          value={props.editorValue}
          width="100%"
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            fontFamily: "'Inconsolata', 'Consolas', monospace"
          }}
          onChange={(...args) => {
            onChange(...args);
            hooks.forEach(hook => hook.onChange && hook.onChange(...args));
          }}
          onCursorChange={(...args) =>
            hooks.forEach(hook => hook.onCursorChange && hook.onCursorChange(...args))
          }
        />
      </div>
    </HotKeys>
  );
});

export default React.memo(EditorBase);
