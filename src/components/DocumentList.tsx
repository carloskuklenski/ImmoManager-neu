import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Upload, Trash2, Download, FileImage, File } from 'lucide-react';

interface DocumentListProps {
  entityType: 'unit' | 'tenant';
  entityId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ entityType, entityId }) => {
  const { documents, addDocument, deleteDocument } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entityDocs = documents.filter(d => d.entityType === entityType && d.entityId === entityId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Base64 for local storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      addDocument({
        name: file.name,
        type: file.type,
        size: file.size,
        url: base64String,
        entityType,
        entityId
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-slate-800">Dokumente</h4>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" /> Hochladen
          </button>
        </div>
      </div>

      {entityDocs.length === 0 ? (
        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Keine Dokumente vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entityDocs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-slate-50 rounded-lg">
                  {getIcon(doc.type)}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <a 
                  href={doc.url} 
                  download={doc.name}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Herunterladen"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
