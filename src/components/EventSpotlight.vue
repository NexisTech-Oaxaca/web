<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, MapPin } from 'lucide-vue-next';

interface Speaker {
  name: string;
  role: string;
  image: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  type?: string;
  status?: string;
  image: string;
  speakers?: Speaker[];
}

const props = defineProps<{
  events: Event[];
}>();

// Compute the spotlight event based on proximity to the current date
const selectEvent = computed(() => {
  if (!props.events || props.events.length === 0) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const futureEvents: { event: Event; diff: number }[] = [];
  const pastEvents: { event: Event; diff: number }[] = [];

  props.events.forEach(event => {
    // Parse event date at start of day
    const eventDate = new Date(event.date + 'T00:00:00');
    const diff = eventDate.getTime() - now.getTime();
    if (diff >= 0) {
      futureEvents.push({ event, diff });
    } else {
      pastEvents.push({ event, diff: Math.abs(diff) });
    }
  });

  if (futureEvents.length > 0) {
    // Sort ascending by diff (closest future event first)
    futureEvents.sort((a, b) => a.diff - b.diff);
    return {
      event: futureEvents[0].event,
      isFuture: true
    };
  } else if (pastEvents.length > 0) {
    // Sort ascending by absolute diff (closest past event first, i.e. most recent)
    pastEvents.sort((a, b) => a.diff - b.diff);
    return {
      event: pastEvents[0].event,
      isFuture: false
    };
  }

  return null;
});

const featured = computed(() => selectEvent.value?.event || null);
const isUpcoming = computed(() => selectEvent.value?.isFuture || false);

// Format date nicely to Spanish, capitalizing the first letter
const formattedDate = computed(() => {
  if (!featured.value?.date) return 'Jueves, 23 Mayo';
  // Use T00:00:00 to avoid timezone offset shifts
  const dateObj = new Date(featured.value.date + 'T00:00:00');
  const formatted = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return formatted.replace(/^\w/, (c) => c.toUpperCase());
});

const locationName = computed(() => featured.value?.location || 'Casa Oaxaca Tech Hub');
const titleText = computed(() => featured.value?.title || 'AI & Patrimonio: Digitalizando la Historia Oaxaqueña');
const descriptionText = computed(() => featured.value?.description || 'Descubre cómo la inteligencia artificial generativa está ayudando a preservar y recrear patrones arquitectónicos de Mitla y Monte Albán.');
</script>

<template>
  <section v-if="featured" class="py-32 px-6 bg-marfil relative">
    <div class="absolute top-0 left-0 w-full h-12 bg-petroleo/5 divider-grecas opacity-10"></div>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-12">
        <div class="reveal">
          <h2 class="text-4xl font-bold text-petroleo font-display">
            {{ isUpcoming ? 'Próximo Evento' : 'Último Evento' }}
          </h2>
          <p class="text-petroleo/60 mt-2">
            {{ isUpcoming ? 'No te pierdas nuestra cita más cercana.' : 'Revive nuestro encuentro más reciente.' }}
          </p>
        </div>
      </div>

      <div class="reveal bg-white rounded-[40px] overflow-hidden shadow-2xl border border-petroleo/5 flex flex-col lg:flex-row group transition-all duration-500 hover:shadow-3xl">
        <div class="lg:w-1/2 relative overflow-hidden h-72 lg:h-auto">
          <img :src="featured.image" :alt="titleText" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" :style="{ viewTransitionName: 'event-image-' + featured.id }" />
          <div class="absolute inset-0 bg-gradient-to-t from-petroleo/60 to-transparent"></div>
          <div class="absolute bottom-8 left-8">
            <span class="px-4 py-1.5 rounded-full bg-ambar text-petroleo text-xs font-bold uppercase tracking-wider">
              {{ isUpcoming ? 'Spotlight Event' : 'Recapitulación' }}
            </span>
          </div>
        </div>
        
        <div class="lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center text-left">
          <div class="space-y-6">
            <div class="flex items-center space-x-6 text-jade font-bold text-sm font-sans">
              <span class="flex items-center"><Calendar class="mr-2 w-4 h-4 text-jade" /> {{ formattedDate }}</span>
              <span class="flex items-center"><MapPin class="mr-2 w-4 h-4 text-jade" /> {{ locationName }}</span>
            </div>
            
            <h3 class="text-4xl lg:text-5xl font-bold text-petroleo leading-tight group-hover:text-jade transition-colors font-display" :style="{ viewTransitionName: 'event-title-' + featured.id }">
              {{ titleText }}
            </h3>
            
            <p class="text-lg text-petroleo/70 leading-relaxed font-sans">
              {{ descriptionText }}
            </p>
            
            <div class="flex items-center justify-between pt-10 border-t border-petroleo/10">
              <div class="flex -space-x-3">
                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?u=a" alt="User">
                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?u=b" alt="User">
                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/100?u=c" alt="User">
                <!-- <div class="w-12 h-12 rounded-full bg-arena border-4 border-white flex items-center justify-center text-xs font-bold text-petroleo">+120</div> -->
              </div>
              <a :href="`/eventos/${featured.id}`" class="bg-jade text-white px-8 py-4 rounded-2xl font-bold hover:bg-petroleo transition-all shadow-lg shadow-jade/20 font-sans">
                {{ isUpcoming ? 'Registrar mi asistencia' : 'Ver resumen' }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
