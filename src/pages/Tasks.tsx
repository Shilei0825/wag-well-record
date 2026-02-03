import { useEffect, useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader } from '@/components/PageHeader';
import { PetSelector } from '@/components/PetSelector';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePets, Pet } from '@/hooks/usePets';
import { usePetTasks, useInitializePetTasks, PetTask, TaskCategory } from '@/hooks/useTasks';
import { useLanguage } from '@/contexts/LanguageContext';
import { isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';

const categoryFilters: { value: TaskCategory | 'all'; labelZh: string; labelEn: string }[] = [
  { value: 'all', labelZh: '全部', labelEn: 'All' },
  { value: 'health', labelZh: '健康', labelEn: 'Health' },
  { value: 'grooming', labelZh: '美容', labelEn: 'Grooming' },
  { value: 'activity', labelZh: '活动', labelEn: 'Activity' },
  { value: 'training', labelZh: '训练', labelEn: 'Training' },
  { value: 'admin', labelZh: '管理', labelEn: 'Admin' },
];

export default function Tasks() {
  const { language } = useLanguage();
  const { data: pets = [], isLoading: petsLoading } = usePets();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState<PetTask | null>(null);

  const initializeTasks = useInitializePetTasks();
  const { data: tasks = [], isLoading: tasksLoading } = usePetTasks(selectedPet?.id);

  // Auto-select first pet
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets, selectedPet]);

  // Initialize default tasks when pet is selected
  useEffect(() => {
    if (selectedPet && !tasksLoading) {
      const species = selectedPet.species as 'dog' | 'cat';
      if (species === 'dog' || species === 'cat') {
        initializeTasks.mutate({ petId: selectedPet.id, species });
      }
    }
  }, [selectedPet?.id]);

  // Filter tasks by category
  const filteredTasks = tasks.filter((task) => {
    if (categoryFilter === 'all') return true;
    return task.category === categoryFilter;
  });

  // Group tasks by status and due date
  const today = new Date();
  const in7Days = addDays(today, 7);

  const overdueTasks = filteredTasks.filter(
    (t) => t.status === 'active' && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
  );

  const dueSoonTasks = filteredTasks.filter((t) => {
    const dueDate = new Date(t.due_date);
    return (
      t.status === 'active' &&
      (isToday(dueDate) || isWithinInterval(dueDate, { start: today, end: in7Days }))
    );
  });

  const laterTasks = filteredTasks.filter((t) => {
    const dueDate = new Date(t.due_date);
    return t.status === 'active' && isFuture(dueDate) && !isWithinInterval(dueDate, { start: today, end: in7Days });
  });

  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const handleEditTask = (task: PetTask) => {
    setEditTask(task);
    setShowAddModal(true);
  };

  const handleCloseModal = (open: boolean) => {
    setShowAddModal(open);
    if (!open) setEditTask(null);
  };

  const renderSection = (title: string, taskList: PetTask[], emptyMessage?: string) => {
    if (taskList.length === 0 && !emptyMessage) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title} ({taskList.length})
        </h3>
        {taskList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {taskList.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (petsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title={language === 'zh' ? '任务' : 'Tasks'} />
        <div className="p-4">
          <EmptyState
            icon={ListTodo}
            title={language === 'zh' ? '先添加宠物' : 'Add a pet first'}
            description={language === 'zh' ? '添加宠物后即可管理任务' : 'Add a pet to start managing tasks'}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title={language === 'zh' ? '任务' : 'Tasks'}
        action={
          selectedPet && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {language === 'zh' ? '添加' : 'Add'}
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Pet selector */}
        {pets.length > 1 && (
          <PetSelector
            pets={pets}
            selectedPet={selectedPet}
            onSelect={setSelectedPet}
          />
        )}

        {/* Category filters */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TaskCategory | 'all')}>
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start">
            {categoryFilters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value} className="shrink-0">
                {language === 'zh' ? filter.labelZh : filter.labelEn}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Task sections */}
        {tasksLoading ? (
          <p className="text-center text-muted-foreground py-8">
            {language === 'zh' ? '加载任务中...' : 'Loading tasks...'}
          </p>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={language === 'zh' ? '暂无任务' : 'No tasks'}
            description={language === 'zh' ? '点击添加按钮创建任务' : 'Click add to create a task'}
          />
        ) : (
          <div className="space-y-6">
            {renderSection(
              language === 'zh' ? '已逾期' : 'Overdue',
              overdueTasks
            )}
            {renderSection(
              language === 'zh' ? '即将到期' : 'Due Soon',
              dueSoonTasks
            )}
            {renderSection(
              language === 'zh' ? '稍后' : 'Later',
              laterTasks
            )}
            {renderSection(
              language === 'zh' ? '已完成' : 'Done',
              doneTasks
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {selectedPet && (
        <AddTaskModal
          open={showAddModal}
          onOpenChange={handleCloseModal}
          petId={selectedPet.id}
          editTask={editTask}
        />
      )}

      <BottomNav />
    </div>
  );
}
