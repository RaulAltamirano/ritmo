<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Crear Nuevo Post</h2>
                <button @click="$emit('close')"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <X class="h-5 w-5" />
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <!-- Tipo de post -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tipo de contenido
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button v-for="type in postTypes" :key="type.value" @click="selectedType = type.value" :class="[
                            'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors',
                            selectedType === type.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        ]">
                            <component :is="type.icon" class="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ type.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Formulario dinámico -->
                <div class="space-y-4">
                    <!-- Técnica de Estudio -->
                    <div v-if="selectedType === 'technique'" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título de la técnica
                            </label>
                            <input v-model="formData.title" type="text" placeholder="Ej: Técnica Pomodoro Modificada"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea v-model="formData.description" rows="3"
                                placeholder="Describe brevemente la técnica..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <select v-model="formData.category"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="Languages">Idiomas</option>
                                    <option value="Sciences">Ciencias</option>
                                    <option value="Programming">Programación</option>
                                    <option value="Medicine">Medicina</option>
                                    <option value="History">Historia</option>
                                    <option value="Mathematics">Matemáticas</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dificultad
                                </label>
                                <select v-model="formData.difficulty"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="Beginner">Principiante</option>
                                    <option value="Intermediate">Intermedio</option>
                                    <option value="Advanced">Avanzado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tu experiencia personal
                            </label>
                            <textarea v-model="formData.personalExperience" rows="4"
                                placeholder="Comparte tu experiencia usando esta técnica..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>

                    <!-- Recomendación de Música -->
                    <div v-else-if="selectedType === 'music'" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Título de la canción
                                </label>
                                <input v-model="formData.title" type="text" placeholder="Ej: Weightless"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Artista
                                </label>
                                <input v-model="formData.artist" type="text" placeholder="Ej: Marconi Union"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Género
                                </label>
                                <input v-model="formData.genre" type="text" placeholder="Ej: Ambient, Lo-fi"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fase de estudio
                                </label>
                                <select v-model="formData.studyPhase"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="focus">Enfoque</option>
                                    <option value="break">Descanso</option>
                                    <option value="deep-work">Trabajo profundo</option>
                                    <option value="review">Repaso</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea v-model="formData.description" rows="3"
                                placeholder="¿Por qué recomiendas esta música para estudiar?"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enlace de Spotify
                                </label>
                                <input v-model="formData.spotifyUrl" type="url"
                                    placeholder="https://open.spotify.com/..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enlace de YouTube
                                </label>
                                <input v-model="formData.youtubeUrl" type="url" placeholder="https://youtube.com/..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    <!-- Imagen -->
                    <div v-else-if="selectedType === 'image'" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título
                            </label>
                            <input v-model="formData.title" type="text" placeholder="Ej: Mi setup de estudio perfecto"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea v-model="formData.description" rows="3"
                                placeholder="Describe la imagen y su relación con el estudio..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                URL de la imagen
                            </label>
                            <input v-model="formData.imageUrl" type="url" placeholder="https://ejemplo.com/imagen.jpg"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <select v-model="formData.category"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="circadian-phase">Fase circadiana</option>
                                    <option value="motivation">Motivación</option>
                                    <option value="study-setup">Setup de estudio</option>
                                    <option value="achievement">Logro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tags (separados por comas)
                                </label>
                                <input v-model="formData.tags" type="text" placeholder="estudio, motivación, setup"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    <!-- Trofeo -->
                    <div v-else-if="selectedType === 'trophy'" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del logro
                            </label>
                            <input v-model="formData.title" type="text"
                                placeholder="Ej: ¡Completé 100 horas de estudio!"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea v-model="formData.description" rows="3"
                                placeholder="Comparte cómo lograste este trofeo..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del logro
                                </label>
                                <input v-model="formData.achievementName" type="text"
                                    placeholder="Ej: Estudiante Persistente"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rareza
                                </label>
                                <select v-model="formData.rarity"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="common">Común</option>
                                    <option value="rare">Raro</option>
                                    <option value="epic">Épico</option>
                                    <option value="legendary">Legendario</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Reseña -->
                    <div v-else-if="selectedType === 'review'" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título de la reseña
                            </label>
                            <input v-model="formData.title" type="text" placeholder="Ej: Reseña del curso de React"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del item
                                </label>
                                <input v-model="formData.itemName" type="text"
                                    placeholder="Ej: Curso de React de Platzi"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <select v-model="formData.category"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Seleccionar...</option>
                                    <option value="book">Libro</option>
                                    <option value="course">Curso</option>
                                    <option value="app">App</option>
                                    <option value="tool">Herramienta</option>
                                    <option value="technique">Técnica</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Calificación (1-5)
                            </label>
                            <div class="flex items-center space-x-2">
                                <button v-for="i in 5" :key="i" @click="formData.rating = i" :class="[
                                    'p-1 rounded',
                                    i <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                                ]">
                                    <Star :class="i <= formData.rating ? 'fill-current' : ''" class="h-6 w-6" />
                                </button>
                                <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ formData.rating
                                    }}/5</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pros (uno por línea)
                                </label>
                                <textarea v-model="formData.pros" rows="3" placeholder="Pros del item..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contras (uno por línea)
                                </label>
                                <textarea v-model="formData.cons" rows="3" placeholder="Contras del item..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Recomendación
                            </label>
                            <textarea v-model="formData.recommendation" rows="3"
                                placeholder="¿Recomendarías este item? ¿Para quién?"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>

                    <!-- Artículo -->
                    <div v-else-if="selectedType === 'article'" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del artículo
                            </label>
                            <input v-model="formData.title" type="text" placeholder="Ej: Cómo mejorar tu concentración"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Extracto
                            </label>
                            <textarea v-model="formData.excerpt" rows="3" placeholder="Resumen breve del artículo..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <input v-model="formData.category" type="text" placeholder="Ej: Productividad"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tiempo de lectura
                                </label>
                                <input v-model="formData.readTime" type="text" placeholder="Ej: 5 min"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags (separados por comas)
                            </label>
                            <input v-model="formData.tags" type="text"
                                placeholder="concentración, estudio, productividad"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enlace externo (opcional)
                            </label>
                            <input v-model="formData.externalUrl" type="url" placeholder="https://ejemplo.com/articulo"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button @click="$emit('close')"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    Cancelar
                </button>
                <button @click="createPost" :disabled="!canCreatePost" :class="[
                    'px-6 py-2 rounded-lg font-medium transition-colors',
                    canCreatePost
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                ]">
                    Publicar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    X,
    Lightbulb,
    Music,
    Image,
    Trophy,
    Star,
    FileText
} from 'lucide-vue-next'
import type { CreatePostData, SocialPost } from '@/types/social'

// Emits
const emit = defineEmits<{
    close: []
    created: [post: SocialPost]
}>()

// Estado local
const selectedType = ref<string>('technique')
const formData = ref<any>({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    personalExperience: '',
    artist: '',
    genre: '',
    studyPhase: '',
    spotifyUrl: '',
    youtubeUrl: '',
    imageUrl: '',
    tags: '',
    achievementName: '',
    rarity: '',
    itemName: '',
    rating: 0,
    pros: '',
    cons: '',
    recommendation: '',
    excerpt: '',
    readTime: '',
    externalUrl: ''
})

// Tipos de posts disponibles
const postTypes = [
    { value: 'technique', label: 'Técnica', icon: Lightbulb },
    { value: 'music', label: 'Música', icon: Music },
    { value: 'image', label: 'Imagen', icon: Image },
    { value: 'trophy', label: 'Trofeo', icon: Trophy },
    { value: 'review', label: 'Reseña', icon: Star },
    { value: 'article', label: 'Artículo', icon: FileText }
]

// Validación
const canCreatePost = computed(() => {
    if (!formData.value.title.trim()) return false

    switch (selectedType.value) {
        case 'technique':
            return formData.value.description.trim() && formData.value.category
        case 'music':
            return formData.value.artist.trim() && formData.value.description.trim()
        case 'image':
            return formData.value.imageUrl.trim() && formData.value.description.trim()
        case 'trophy':
            return formData.value.achievementName.trim() && formData.value.description.trim()
        case 'review':
            return formData.value.itemName.trim() && formData.value.rating > 0
        case 'article':
            return formData.value.excerpt.trim() && formData.value.category.trim()
        default:
            return false
    }
})

// Métodos
const createPost = () => {
    if (!canCreatePost.value) return

    // Crear el post basado en el tipo seleccionado
    const postData: CreatePostData = {
        type: selectedType.value as any,
        content: {
            ...formData.value,
            tags: formData.value.tags ? formData.value.tags.split(',').map((tag: string) => tag.trim()) : [],
            pros: formData.value.pros ? formData.value.pros.split('\n').filter((pro: string) => pro.trim()) : [],
            cons: formData.value.cons ? formData.value.cons.split('\n').filter((con: string) => con.trim()) : []
        }
    }

    // Crear el post completo (esto sería manejado por el backend en una app real)
    const newPost: SocialPost = {
        id: Date.now().toString(),
        author: {
            id: 'current-user',
            name: 'Tu Nombre',
            username: 'tu_usuario',
            initials: 'TU',
            avatar: '/avatars/current-user.jpg',
            role: 'Estudiante',
            experience: '2 años',
            verified: true,
            followersCount: 150,
            followingCount: 200
        },
        content: postData.content as any,
        interactions: {
            likes: 0,
            comments: 0,
            shares: 0,
            bookmarks: 0,
            isLiked: false,
            isBookmarked: false
        },
        comments: [],
        createdAt: new Date(),
        isPinned: false,
        isFeatured: false
    }

    emit('created', newPost)
}
</script>
