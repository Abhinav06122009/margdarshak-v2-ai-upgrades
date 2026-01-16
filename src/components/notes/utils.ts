
export const getCurrentWeekDays = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date: date.getDate(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  return days;
};
