const { fetchApi } = require('../utils/api');

async function tasks(config) {
  try {
    console.log('Начинаем выполнение задач');
    const { tasks } = await fetchApi('/list-tasks', 'POST', null, config.bearerToken);
    
    const incompletedTasks = tasks.filter(t => t.isCompleted === false);
    
    if (incompletedTasks.length > 0) {
      console.log('Найдены невыполненные задачи:', incompletedTasks);
      
      const results = await Promise.all(incompletedTasks.map(task => 
        fetchApi('/check-task', 'POST', { taskId: task.id }, config.bearerToken)
      ));
      
      console.log('Результаты выполнения задач:', results);
    } else {
      console.log('Все задачи уже выполнены');
    }
  } catch (error) {
    console.error('Ошибка при выполнении задач:', error);
  }
}

module.exports = tasks;
