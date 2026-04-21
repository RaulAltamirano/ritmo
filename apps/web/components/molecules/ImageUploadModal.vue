<template>
  <BaseModal
    :is-open="isOpen"
    title="Upload Image"
    size="sm"
    backdrop="blur"
    animation="scale"
    :close-on-backdrop-click="true"
    :close-on-escape="true"
    :prevent-scroll="true"
    @update:is-open="$emit('update:isOpen', $event)"
    @close="$emit('close')"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg flex items-center justify-center"
        >
          <Upload class="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Upload Image</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Share your image with the community
          </p>
        </div>
      </div>
    </template>

    <!-- Contenido del modal -->
    <div class="space-y-6">
      <!-- Selector de fase con dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select phase *
        </label>
        <select
          v-model="selectedPhase"
          class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="" disabled>Choose a phase</option>
          <option v-for="phase in phases" :key="phase.id" :value="phase.id">
            {{ phase.emoji }} {{ phase.name }}
          </option>
        </select>
      </div>

      <!-- Subida de imagen -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select image *
        </label>
        <div
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
          class="border-2 border-dashed border-outline-strong rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500 dark:hover:border-blue-400"
          :class="isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''"
        >
          <div v-if="!selectedFile" class="space-y-2">
            <Upload class="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                Drag your image here
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">or click to select</p>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 5MB</p>
          </div>

          <div v-else class="space-y-3">
            <img
              :src="previewUrl"
              alt="Preview"
              class="w-24 h-24 object-cover rounded-lg mx-auto"
            />
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ selectedFile.name }}
            </p>
            <BaseButton variant="outline" size="sm" :icon="Upload" @click="removeFile">
              Change image
            </BaseButton>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          v-model="description"
          rows="2"
          placeholder="Describe your image..."
          class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>
    </div>

    <!-- Footer con botones de acción -->
    <template #footer>
      <BaseButton variant="outline" @click="$emit('close')"> Cancel </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!canSubmit"
        :loading="isUploading"
        @click="handleUpload"
      >
        Upload Image
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
import { Upload } from 'lucide-vue-next'
import { computed, ref } from 'vue'

  interface Phase {
    id: string
    name: string
    emoji: string
    icon: string
    color: string
    image: string
    category: string
    priority: string
    startHour: number
    endHour: number
    duration: number
    keyword: string
    description: string
    idealFor: string
  }

  interface ImageUploadModalProps {
    isOpen: boolean
    phases: Phase[]
  }

  const props = defineProps<ImageUploadModalProps>()

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    'upload-success': [image: any]
  }>()

  // Estado del formulario
  const selectedPhase = ref<string>('')
  const selectedFile = ref<File | null>(null)
  const description = ref('')
  const isUploading = ref(false)
  const isDragOver = ref(false)
  const fileInput = ref<HTMLInputElement>()

  // Preview de la imagen
  const previewUrl = computed(() => {
    if (!selectedFile.value) return ''
    return URL.createObjectURL(selectedFile.value)
  })

  // Validación del formulario
  const canSubmit = computed(() => {
    return selectedPhase.value && selectedFile.value && description.value.trim()
  })

  // Métodos
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      selectedFile.value = target.files[0]
    }
  }

  const handleDrop = (event: DragEvent) => {
    isDragOver.value = false
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      selectedFile.value = event.dataTransfer.files[0]
    }
  }

  const removeFile = () => {
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  const handleUpload = async () => {
    if (!canSubmit.value) return

    isUploading.value = true

    try {
      // Simular subida de imagen
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Crear objeto de imagen
      const newImage = {
        id: Date.now().toString(),
        url: previewUrl.value,
        phase: selectedPhase.value,
        phaseName: props.phases.find(p => p.id === selectedPhase.value)?.name || '',
        uploadedBy: 'Tú',
        uploadedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        description: description.value,
      }

      emit('upload-success', newImage)
    } catch (error) {
      console.error('Error al subir imagen:', error)
    } finally {
      isUploading.value = false
    }
  }
</script>
