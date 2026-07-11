<script setup lang="ts">
import { ref, onMounted } from 'vue';

const metrics = ref({
  aqi: 42,
  temp: 28.4,
  humidity: 62,
  pm25: 12
});

// Simulate real-time updates
onMounted(() => {
  setInterval(() => {
    metrics.value.aqi = Math.max(30, Math.min(60, metrics.value.aqi + (Math.random() * 4 - 2)));
    metrics.value.temp = parseFloat((metrics.value.temp + (Math.random() * 0.4 - 0.2)).toFixed(1));
    metrics.value.humidity = Math.max(50, Math.min(70, Math.round(metrics.value.humidity + (Math.random() * 2 - 1))));
    metrics.value.pm25 = Math.max(5, Math.min(20, Math.round(metrics.value.pm25 + (Math.random() * 2 - 1))));
  }, 3000);
});
</script>

<template>
  <div class="bg-[#161B22] p-8 rounded-[32px] border border-white/10 relative z-10 font-mono text-sm">
    <div class="flex items-center justify-between mb-8">
      <div class="flex gap-2">
        <div class="w-3 h-3 rounded-full bg-coral"></div>
        <div class="w-3 h-3 rounded-full bg-ambar"></div>
        <div class="w-3 h-3 rounded-full bg-jade"></div>
      </div>
      <span class="text-xs text-white/30">live_metrics.sh</span>
    </div>
    <div class="space-y-4">
      <div class="flex justify-between text-jade">
        <span>AQI_INDEX</span>
        <span>{{ Math.round(metrics.aqi) }} (Good)</span>
      </div>
      <div class="w-full bg-white/5 h-1.5 rounded-full">
        <div class="bg-jade h-full transition-all duration-1000" :style="{ width: `${metrics.aqi}%` }"></div>
      </div>
      <div class="flex justify-between text-white/60">
        <span>TEMP_OAXACA_VALLES</span>
        <span>{{ metrics.temp }} °C</span>
      </div>
      <div class="flex justify-between text-white/60">
        <span>HUMIDITY_AVG</span>
        <span>{{ metrics.humidity }}%</span>
      </div>
      <div class="flex justify-between text-white/60">
        <span>PM2.5_LEVEL</span>
        <span>{{ metrics.pm25 }} µg/m³</span>
      </div>
    </div>
  </div>
</template>
