import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAI from '../components/ChatAI';
import Editorial from '../components/Editorial';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  
  // 1. ADDED: State to trigger re-fetching of submission history
  const [refreshHistory, setRefreshHistory] = useState(0);
  
  const editorRef = useRef(null);
  
  let { id } = useParams();
  const problemById = id;
  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemById) return; 

      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemById}`);
        
        const codeObj = response.data?.startCode?.find(sc => sc.language === selectedLanguage);
        const initialCode = codeObj ? codeObj.initialCode : '';

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemById, selectedLanguage]);

  useEffect(() => {
    if (problem) {
      const codeObj = problem?.startCode?.find(sc => sc.language === selectedLanguage);
      setCode(codeObj ? codeObj.initialCode : '');
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveRightTab('testcase'); // Switch tab immediately so user sees loading state
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemById}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: 'Runtime Error', errorMessage: 'Internal server error' });
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result'); // Switch tab immediately so user sees loading state
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemById}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      
      // 2. ADDED: Trigger the history tab to reload its data
      setRefreshHistory(prev => prev + 1);
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, status: 'Server Error', errorMessage: 'Failed to reach the server.' });
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('description')}>Description</button>
          <button className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('editorial')}>Editorial</button>
          <button className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('solutions')}>Solutions</button>
          <button className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('submissions')}>Submissions</button>
          <button className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('chatAI')}>ChatAI</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </div>
                    {problem?.tags?.map((tag, index) => (
                      <div key={index} className="badge badge-primary">{tag}</div>
                    ))}
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {problem?.visibleTestCases?.map((example, index) => (
                        <div key={index} className="bg-base-200 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono">
                            <div><strong className="text-gray-400">Input:</strong> <span className="text-gray-300">{example.input}</span></div>
                            <div><strong className="text-gray-400">Output:</strong> <span className="text-gray-300">{example.output}</span></div>
                            {example.explanation && <div><strong className="text-gray-400">Explanation:</strong> <span className="text-gray-300">{example.explanation}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="mb-8">
                      <Editorial 
                        secureUrl={problem.secureUrl}
                        thumbnailUrl={problem.thumbnailUrl}
                        duration={problem.duration} 
                      />
                    </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {'Editorial is here for the problem'}
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem?.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-base-300 rounded-lg">
                        <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                          <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="h-full">
                  {/* 3. ADDED: Passed refreshTrigger to the component */}
                  <SubmissionHistory problemId={problemById} refreshTrigger={refreshHistory} />
                </div>
              )}
              {activeLeftTab === 'chatAI' && (
                <div className="h-full pb-4">
                  <ChatAI 
                    title={problem.title} 
                    description={problem.description} 
                    visibleTestCases={problem.visibleTestCases} 
                    startCode={problem.startCode} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('code')}>Code</button>
          <button className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('testcase')}>Testcase</button>
          <button className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('result')}>Result</button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              <div className="p-4 border-t border-base-300 flex justify-between bg-base-100">
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveRightTab('testcase')}>Console</button>
                </div>
                <div className="flex gap-2">
                  <button className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`} onClick={handleRun} disabled={loading}>Run</button>
                  <button className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`} onClick={handleSubmitCode} disabled={loading}>Submit</button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
              {loading && (
                <div className="flex items-center gap-3 text-blue-400">
                  <span className="loading loading-spinner loading-md"></span>
                  Running test cases...
                </div>
              )}

              {!loading && runResult && (
                <div className={`p-4 rounded-lg border ${runResult.success === 'Accepted' ? 'bg-green-900/10 border-green-700' : 'bg-red-900/10 border-red-700'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${runResult.success === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                    {runResult.success}
                  </h3>
                  
                  <div className="flex gap-4 text-sm text-gray-300">
                    <span className="bg-[#191e24] px-3 py-1 rounded-full border border-gray-700">
                      Runtime: {runResult.runtime ? runResult.runtime.toFixed(3) : 0} s
                    </span>
                    <span className="bg-[#191e24] px-3 py-1 rounded-full border border-gray-700">
                      Memory: {runResult.memory} KB
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Visible Test Cases</h3>
                <div className="flex flex-col gap-4">
                  {problem?.visibleTestCases?.map((example, index) => (
                    <div key={index} className="bg-[#2a303c] p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-400">Case {index + 1}</h4>
                      <div className="space-y-2 text-sm font-mono">
                        <div><strong className="text-gray-500">Input:</strong> {example.input}</div>
                        <div><strong className="text-gray-500">Expected Output:</strong> {example.output}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-white">Submission Result</h3>
              
              {!submitResult && !loading && (
                <p className="text-gray-500">Run or submit code to see results here.</p>
              )}
              
              {loading && (
                <div className="flex items-center gap-3 text-blue-400">
                  <span className="loading loading-spinner loading-md"></span>
                  Evaluating submission against hidden test cases...
                </div>
              )}
              
              {!loading && submitResult && (
                <div className={`p-6 rounded-lg border shadow-lg ${submitResult.accepted ? 'bg-green-900/10 border-green-700' : 'bg-red-900/10 border-red-700'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${submitResult.accepted ? 'text-green-400' : 'text-red-400'}`}>
                    {submitResult.status}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#191e24] p-4 rounded-lg border border-gray-800">
                      <div className="text-gray-500 text-sm mb-1">Test Cases Passed</div>
                      <div className="text-2xl font-bold text-white">
                        {submitResult.passedTestCases} <span className="text-gray-500 text-lg">/ {submitResult.totalTestCases}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#191e24] p-4 rounded-lg border border-gray-800">
                      <div className="text-gray-500 text-sm mb-1">Performance</div>
                      <div className="text-sm font-mono text-gray-300 space-y-1">
                        <div><span className="text-gray-500">Runtime:</span> {submitResult.runtime ? submitResult.runtime.toFixed(3) : 0} s</div>
                        <div><span className="text-gray-500">Memory:</span> {submitResult.memory} KB</div>
                      </div>
                    </div>
                  </div>

                  {!submitResult.accepted && submitResult.errorMessage && (
                    <div className="mt-6">
                      <h4 className="text-red-400 font-semibold mb-2">Error Details:</h4>
                      <div className="bg-[#191e24] p-4 rounded-lg border border-red-900 overflow-x-auto text-red-300 font-mono text-sm whitespace-pre-wrap">
                        {submitResult.errorMessage}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;