import { createClient } from '@/lib/supabase/server'
import { FolderOpen, Upload, FileText, Image, Film, FileArchive, HardDrive } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export default async function FilesPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!organization) return null

  // For now, show a placeholder with instructions
  // In production, this would list files from Supabase Storage

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archivos</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Gestión de archivos y entregas
            </p>
          </div>
          <button 
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition opacity-50 cursor-not-allowed"
            disabled
          >
            <Upload className="w-5 h-5" />
            Subir archivo
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Coming Soon Message */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Gestión de archivos</h2>
          <p className="text-gray-600 mb-8">
            Próximamente podrás subir y organizar archivos para cada solicitud.
            Los clientes podrán descargar las entregas directamente desde su portal.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Imágenes</span>
              </div>
              <p className="text-sm text-gray-500">PNG, JPG, SVG, WebP</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium">Documentos</span>
              </div>
              <p className="text-sm text-gray-500">PDF, DOC, XLS</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium">Videos</span>
              </div>
              <p className="text-sm text-gray-500">MP4, MOV, WebM</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileArchive className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-medium">Comprimidos</span>
              </div>
              <p className="text-sm text-gray-500">ZIP, RAR</p>
            </div>
          </div>

          {/* Storage Info */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Almacenamiento disponible</span>
            </div>
            <span className="font-medium">
              {organization.subscription_status === 'trial' ? '2 GB' : 
               organization.subscription_status === 'active' ? '25 GB' : '2 GB'}
            </span>
          </div>
        </div>

        {/* Technical Note */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Nota técnica:</strong> Para habilitar la subida de archivos, 
              configurá Supabase Storage en tu proyecto. Los archivos se almacenarán 
              de forma segura y estarán disponibles para cada solicitud.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
