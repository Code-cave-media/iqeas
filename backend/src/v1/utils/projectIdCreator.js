export const generateProjectId = () => {
  const prefix = "PRJ";
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().getDate();
    
  const createdProjectId = `${prefix}-${currentYear}-${currentDate}`;
  console.log(createdProjectId);
    
  return createdProjectId;
};
