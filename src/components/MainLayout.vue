<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { NLayout, NLayoutContent, NLayoutHeader, NTab, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import TopNav from '@/components/TopNav.vue'

const {
  activeKey,
  handleTabsChange,
} = useTabs()

const headerRef = ref<HTMLElement>()
const headerHeight = ref(0)

function useTabs() {
  const activeKey = ref()
  const route = useRoute()
  const router = useRouter()
  watch(() => route.path, (value) => {
    if (value === '/home')
      activeKey.value = 'MindMap'

    else
      activeKey.value = 'Paper'
  }, { immediate: true })

  function handleTabsChange(value: string) {
    if (value === 'MindMap')
      router.push('/home')
    else
      router.push('/paper')
  }

  return {
    activeKey,
    handleTabsChange,
  }
}

onMounted(() => {
  headerHeight.value = headerRef.value?.offsetHeight ?? 0
})
</script>

<template>
  <NLayout style="height: 100vh;overflow: hidden;position: relative;background: #0F1729;">
    <div ref="headerRef">
      <NLayoutHeader>
        <TopNav />
        <div class="bg-#1e293b p-3">
          <NTabs v-model:value="activeKey" type="line" animated :on-update-value="handleTabsChange">
            <NTab name="MindMap" />
          </NTabs>
        </div>
      </NLayoutHeader>
    </div>

    <NLayoutContent :style="{ height: `calc(100vh - ${headerHeight}px` }">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </NLayoutContent>
  </NLayout>
</template>
