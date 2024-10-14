export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'ri-home-smile-2-line' },
  },
  {
    title: 'Dashoard',
    to: { name: 'accounting-dashboard' }, 
    icon: { icon: 'ri-dashboard-2-line' }, 
  },
  {
    title: 'Journal Entry',
    to: { name: 'accounting-journals-entry' },
    icon: { icon: 'ri-calendar-event-line' }, 
  },
  {
    title: 'Configration',
    to: { name: 'accounting-journals' },
    icon: { icon: 'ri-tools-line' },
    children: [
          {
            title: 'CoA',
            to: { name: 'accounting-charts' },  // Ensure this matches your route name
          },
          {
            title: 'Journals',
            to: { name: 'accounting-journals' },  // Ensure this matches your route name
          },
          {
            title: 'Category',
            to: { name: 'accounting-category' },  // Ensure this matches your route name
          },
    ],
  },
  {
    title: 'Settings',
    to: { name: 'accounting-settings' },
    icon: { icon: 'ri-settings-2-line' }, 
  },
]
