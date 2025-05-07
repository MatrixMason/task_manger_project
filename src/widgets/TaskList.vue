&lt;script setup lang=&quot;ts&quot;&gt;
import { computed, ref } from 'vue'
import type { Task } from '@/entities/task/model/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'
import UserFilter from '@/entities/task/components/UserFilter.vue'

defineOptions({
  name: 'TaskList',
})

const props = defineProps&lt;{
  tasks: Task[]
}&gt;()

const selectedUserId = ref&lt;number | null&gt;(null)

const filteredTasks = computed(() =&gt; {
  if (!selectedUserId.value) return props.tasks
  return props.tasks.filter((task) =&gt; task.assignedTo === selectedUserId.value)
})

const sortedTasks = computed(() =&gt;
  [...filteredTasks.value].sort(
    (a, b) =&gt; new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)
&lt;/script&gt;

&lt;template&gt;
  &lt;div class=&quot;task-list&quot;&gt;
    &lt;div class=&quot;task-list__header&quot;&gt;
      &lt;UserFilter @filter=&quot;userId =&gt; selectedUserId = userId ?? null&quot; /&gt;
    &lt;/div&gt;
    &lt;TaskCard v-for=&quot;task in sortedTasks&quot; :key=&quot;task.id&quot; :task=&quot;task&quot; /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style lang=&quot;scss&quot; scoped&gt;
@import '@/app/styles/variables';

.task-list {
  &amp;__header {
    margin-bottom: $spacing-md;
  }

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-md;
}
&lt;/style&gt;
