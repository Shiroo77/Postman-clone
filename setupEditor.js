import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

export default function setupEditors() {
  const jsonRequestBody = document.querySelector("[data-json-request-body]");
  const jsonResponseBody = document.querySelector("[data-json-response-body]");

  const basicExtensions = [
    basicSetup,
    // This will allows us to use the TAB inside our text editor
    // Instead of tabbing to the new input it'll stay inside the text editor
    keymap.of([defaultTabBinding]),
    json(), // Language we're using

    // Setup Tab size. 2 spacing for every single tab
    EditorState.tabSize.of(2),
  ];

  const requestEditor = new EditorView({
    // State is the information on our editor
    // Parent is what we're gonna attach this information too
    state: EditorState.create({
      // doc is like textcontent
      doc: "{\n\t\n}",
      // extension tells how exactly your editor works
      extensions: basicExtensions,
    }),
    parent: jsonRequestBody,
  });

  const responseEditor = new EditorView({
    state: EditorState.create({
      doc: "{}",
      // Add one extension - To make sure that it's read-only
      extensions: [...basicExtensions, EditorView.editable.of(false)],
    }),
    parent: jsonResponseBody,
  });

  // This will update the content insdie of response editor
  function updateResponseEditor(value) {
    // Dispatch will tell us all the changes we wanna make inside the changes object
    responseEditor.dispatch({
      changes: {
        // Take all the text from our document & replace it with new text
        from: 0,
        to: responseEditor.state.doc.length,
        // null, 2 will make it print out like Pretty JSON
        insert: JSON.stringify(value, null, 2),
      },
    });
  }

  return { requestEditor, updateResponseEditor };
}
