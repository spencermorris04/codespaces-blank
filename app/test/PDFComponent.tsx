import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

interface ScreenplayElement {
  line_number: number;
  text: string;
}

interface Character {
  name: string;
  dialogue: ScreenplayElement[];
}

interface Screenplay {
  scene_headings: ScreenplayElement[];
  characters: Character[];
  screen_directions: ScreenplayElement[];
}

const PDFComponent: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [parsedScreenplay, setParsedScreenplay] = useState<Screenplay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const setupPdfWorker = async () => {
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
    };
    setupPdfWorker();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const text = await extractTextFromPdf(pdf);
      setExtractedText(text);
      const lines = text.split('\n');
      const screenplay = parseScreenplay(lines);
      const sceneHeadings = parseSceneHeadings(lines);
      const screenDirections = parseScreenDirections(lines);
      const processedScreenplay = postProcessScreenplay({
        ...screenplay,
        scene_headings: sceneHeadings,
        screen_directions: screenDirections
      });
      setParsedScreenplay(processedScreenplay);
      console.log("Parsed Screenplay JSON:", JSON.stringify(processedScreenplay, null, 2));
    } catch (error) {
      console.error('Error processing PDF:', error);
      setExtractedText('Error processing PDF');
      setParsedScreenplay(null);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPdf = async (pdf: PDFDocumentProxy): Promise<string> => {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = formatTextContent(textContent.items as TextItem[]);
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const formatTextContent = (textItems: TextItem[]): string => {
    const lineHeight = 12; // Adjust based on your PDF's typical line height
    let formattedText = '';
    let lastY = 0;
    let lastX = 0;

    textItems.forEach((item) => {
      if (Math.abs(lastY - item.transform[5]) > lineHeight / 2) {
        // New line
        formattedText += '\n';
        lastX = 0;
      }
      const spaces = Math.max(0, Math.round((item.transform[4] - lastX) / 4)); // Adjust divisor as needed
      formattedText += ' '.repeat(spaces) + item.str;
      lastY = item.transform[5];
      lastX = item.transform[4] + item.width;
    });

    return formattedText;
  };

  const parseScreenplay = (lines: string[]): Screenplay => {
    const screenplay: Screenplay = {
      scene_headings: [],
      characters: [],
      screen_directions: []
    };
  
    let currentCharacter: string | null = null;
    let currentDialogue: string[] = [];
    let dialogueStartLine: number | null = null;
  
    const finalizeDialogue = () => {
      if (currentDialogue.length > 0 && currentCharacter && dialogueStartLine !== null) {
        const dialogueText = currentDialogue.join(' ').trim();
        if (dialogueText) {
          const dialogueElement: ScreenplayElement = {
            line_number: dialogueStartLine,
            text: dialogueText
          };
          const existingCharacter = screenplay.characters.find(char => char.name === currentCharacter);
          if (existingCharacter) {
            existingCharacter.dialogue.push(dialogueElement);
          } else {
            screenplay.characters.push({ name: currentCharacter, dialogue: [dialogueElement] });
          }
        }
        currentDialogue = [];
        dialogueStartLine = null;
      }
    };
  
    const getCharacterName = (name: string): string => {
        return name.replace(/ \(CONT’D\)$/, '').trim();
    };
  
    lines.forEach((line, index) => {
      if (line.startsWith(' '.repeat(63))) {
        finalizeDialogue();
        currentCharacter = getCharacterName(line.trim());
      } else if (line.startsWith(' '.repeat(45)) && currentCharacter) {
        if (currentDialogue.length === 0) {
          dialogueStartLine = index + 1;
        }
        currentDialogue.push(line.trim());
      } else {
        finalizeDialogue();
      }
    });
  
    finalizeDialogue();
  
    return screenplay;
  };

  const postProcessScreenplay = (screenplay: Screenplay): Screenplay => {
    // Merge consecutive screen directions
    const mergedScreenDirections: ScreenplayElement[] = [];
    for (const direction of screenplay.screen_directions) {
      if (mergedScreenDirections.length === 0 || 
          direction.line_number !== mergedScreenDirections[mergedScreenDirections.length - 1].line_number + 1) {
        mergedScreenDirections.push(direction);
      } else {
        mergedScreenDirections[mergedScreenDirections.length - 1].text += ' ' + direction.text;
      }
    }
    screenplay.screen_directions = mergedScreenDirections;

    // Handle character name continuations
    screenplay.characters = screenplay.characters.map(character => {
      const nameParts = character.name.split('(');
      const name = nameParts[0].trim();
      const continuation = nameParts[1] ? ' (' + nameParts[1].trim() : '';
      return { ...character, name: name + continuation };
    });

    return screenplay;
  };

  const parseSceneHeadings = (lines: string[]): ScreenplayElement[] => {
    const sceneHeadings: ScreenplayElement[] = [];
  
    lines.forEach((line, index) => {
      // Check for exactly 27 leading spaces and ensure the line is all uppercase
      if (line.startsWith(' '.repeat(27)) && 
          !line.startsWith(' '.repeat(28)) && 
          line.trim() === line.trim().toUpperCase() &&
          line.trim().length > 0) {
        sceneHeadings.push({
          line_number: index + 1,
          text: line.trim()
        });
      }
    });
  
    return sceneHeadings;
  };

  const parseScreenDirections = (lines: string[]): ScreenplayElement[] => {
    const screenDirections: ScreenplayElement[] = [];
    let currentDirection: ScreenplayElement | null = null;
  
    lines.forEach((line, index) => {
      // Check for exactly 27 leading spaces and ensure the line is not all uppercase
      if (line.startsWith(' '.repeat(27)) && 
          !line.startsWith(' '.repeat(28)) && 
          line.trim() !== line.trim().toUpperCase() &&
          line.trim().length > 0) {
        
        if (currentDirection) {
          // If there's a current direction, append this line to it
          currentDirection.text += ' ' + line.trim();
        } else {
          // Start a new direction, capturing the current line number
          currentDirection = {
            line_number: index + 1,
            text: line.trim()
          };
        }
      } else {
        // If the line doesn't match criteria, finalize the current direction if it exists
        if (currentDirection) {
          screenDirections.push(currentDirection);
          currentDirection = null;
        }
      }
    });
  
    // Add the last direction if it exists
    if (currentDirection) {
      screenDirections.push(currentDirection);
    }
  
    return screenDirections;
  };
  
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "extracted_screenplay.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderScreenplayElements = () => {
    if (!parsedScreenplay) return null;
  
    const allElements: { type: string; element: ScreenplayElement; characterName?: string }[] = [
      ...parsedScreenplay.scene_headings.map(e => ({ type: 'scene_heading', element: e })),
      ...parsedScreenplay.screen_directions.map(e => ({ type: 'screen_direction', element: e })),
      ...parsedScreenplay.characters.flatMap(char => 
        char.dialogue.flatMap(d => [
          { type: 'character', element: { line_number: d.line_number - 1, text: char.name.toUpperCase() } },
          { type: 'dialogue', element: d, characterName: char.name }
        ])
      )
    ];
  
    allElements.sort((a, b) => a.element.line_number - b.element.line_number);
  
    return allElements.map((item, index) => {
      let bgColor, style;
      switch (item.type) {
        case 'scene_heading':
          bgColor = 'bg-blue-200';
          style = { marginLeft: '1.5in', maxWidth: 'calc(100% - 2.5in)' };
          break;
        case 'screen_direction':
          bgColor = 'bg-green-200';
          style = { marginLeft: '1.5in', maxWidth: 'calc(100% - 2.5in)' };
          break;
        case 'character':
          bgColor = 'bg-yellow-200';
          style = { marginLeft: '3.7in', maxWidth: 'calc(100% - 4.7in)' };
          break;
        case 'dialogue':
          bgColor = 'bg-red-200';
          style = { marginLeft: '2.5in', maxWidth: 'calc(100% - 3.5in)' };
          break;
        default:
          bgColor = 'bg-gray-200';
          style = {};
      }
  
      return (
        <div key={index} className="my-2">
          <div className={`p-1 rounded ${bgColor} inline-block`} style={style}>
            {item.element.text}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="mb-4 p-2 border rounded"
      />
      {isLoading && <p>Processing PDF...</p>}
      {extractedText && (
        <button 
          onClick={downloadTxtFile}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download as TXT
        </button>
      )}
      {parsedScreenplay && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Screenplay Visualization:</h2>
          <div className="screenplay-visualization" style={{ width: '8.5in', margin: '0 auto', backgroundColor: 'white', padding: '1in', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            {renderScreenplayElements()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFComponent;