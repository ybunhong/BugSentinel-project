import { CodeAnalysisWorkspace } from '../components/CodeAnalysisWorkspace';

export const CodeAnalysisPage: React.FC = () => {
  return (
    <CodeAnalysisWorkspace initialCode={''} initialLanguage={'javascript'} />
  );
}