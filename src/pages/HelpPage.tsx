import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ArrowLeft, X, Paperclip, AlertTriangle, CheckCircle, Clock, Search, Filter, User, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import showToast from '../../utils/toast';

const HelpPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('help');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Form state
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    attachments: [],
    notifyEmail: true
  });

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterCategory, setFilterCategory] = useState('All Categories');

  // Sample data
  const helpTopics = [
    {
      title: 'Getting Started',
      description: 'Learn how to set up your account and start exploring insights.',
      faqs: [
        { question: 'How do I set up my DSIQ account?', answer: 'Go to your profile settings and fill out the required information.' },
        { question: 'What is the DSIQ dashboard?', answer: 'Its your central hub for viewing and analyzing business insights.' },
      ],
    },
    {
      title: 'Connecting Data Sources',
      description: 'Integrate external systems to power your dashboards.',
      faqs: [
        { question: 'How do I connect a data source?', answer: 'Navigate to Settings > Data Sources, then click "Connect New Source".' },
        { question: 'What formats are supported?', answer: 'We support CSV, JSON, Google Sheets, and APIs.' },
      ],
    },
    {
      title: 'Generating Insights',
      description: 'Use your data to uncover trends and KPIs.',
      faqs: [
        { question: 'How are insights generated?', answer: 'You can create insights from dashboards or use the Insights Generator tool.' },
        { question: 'Can I share insights?', answer: 'Yes, insights can be exported or shared via link.' },
      ],
    },
    {
      title: 'Managing Users',
      description: 'Control access and permissions across your organization.',
      faqs: [
        { question: 'How do I invite a new user?', answer: 'Go to Team Management > Invite User and select their role.' },
        { question: 'What are the roles in DSIQ?', answer: 'Admin, Analyst, and Viewer with varying permissions.' },
      ],
    },
    {
      title: 'Troubleshooting',
      description: 'Solve common issues and contact support.',
      faqs: [
        { question: 'Why is my data not showing?', answer: 'Check your source sync status and filters on the dashboard.' },
        { question: 'How do I contact support?', answer: 'Click the "Generate Ticket" button below or email support@dsiq.io' },
      ],
    },
  ];

  const categories = [
    'Technical Issue', 
    'Dashboard Bug', 
    'Data Error', 
    'Feature Request', 
    'Billing', 
    'Access Request',
    'Account Management',
    'API Integration'
  ];

  // Sample tickets data
  useEffect(() => {
    // In a real app, this would come from an API
    const sampleTickets = [
      {
        id: 'DSIQ-1245',
        title: 'Dashboard not loading properly',
        status: 'In Progress',
        category: 'Dashboard Bug',
        priority: 'High',
        date: '2023-05-15',
        assignedTo: 'Support Team',
        comments: [
          {
            text: 'We\'re looking into this issue. Can you provide more details about your browser version?',
            author: 'Support Team',
            date: '2023-05-15 14:30'
          }
        ]
      },
      {
        id: 'DSIQ-1244',
        title: 'Request for additional user seats',
        status: 'Open',
        category: 'Account Management',
        priority: 'Medium',
        date: '2023-05-14',
        assignedTo: '',
        comments: []
      },
      {
        id: 'DSIQ-1241',
        title: 'Data discrepancy in monthly report',
        status: 'Resolved',
        category: 'Data Error',
        priority: 'High',
        date: '2023-05-10',
        assignedTo: 'Data Team',
        comments: [
          {
            text: 'This was caused by a timezone issue in our processing. Fixed in v2.4.1',
            author: 'Data Team',
            date: '2023-05-12 09:15'
          }
        ]
      }
    ];
    setTickets(sampleTickets);
  }, []);

  const handleGoBack = () => navigate(-1);
  const handleDashboardClick = () => navigate('/');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Show smart suggestions when description changes
    if (name === 'description' && value.length > 20) {
      findSuggestedArticles(value);
    }
  };

  const findSuggestedArticles = (text) => {
    // In a real app, this would search your knowledge base
    const keywords = text.toLowerCase().split(' ');
    const matchedArticles = helpTopics
      .flatMap(topic => topic.faqs.map(faq => ({
        ...faq,
        category: topic.title
      })))
      .filter(faq => 
        keywords.some(keyword => 
          faq.question.toLowerCase().includes(keyword) || 
          faq.answer.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 3);
    
    setSuggestedArticles(matchedArticles);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setTicketForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setTicketForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const submitTicket = (e) => {
    e.preventDefault();
    // In a real app, this would submit to your backend
    const newTicket = {
      id: `DSIQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketForm.title,
      status: 'Open',
      category: ticketForm.category,
      priority: ticketForm.priority,
      date: new Date().toISOString().split('T')[0],
      assignedTo: '',
      comments: []
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setShowTicketForm(false);
    setTicketForm({
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
      attachments: [],
      notifyEmail: true
    });
    
    showToast.success('Ticket submitted successfully!');

    // For demo purposes, show feedback after 5 seconds
    setTimeout(() => {
      setShowFeedback(true);
    }, 5000);
  };

  const submitFeedback = () => {
    // In a real app, this would submit to your backend
    console.log('Feedback submitted:', { rating: feedbackRating, comment: feedbackComment });
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackComment('');
  };

  const renderStatusBadge = (status) => {
    const statusClasses = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      'Open': <Clock size={14} className="mr-1" />,
      'In Progress': <AlertTriangle size={14} className="mr-1" />,
      'Resolved': <CheckCircle size={14} className="mr-1" />,
      'Closed': <X size={14} className="mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const renderPriorityBadge = (priority) => {
    const priorityClasses = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'High': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[priority]}`}>
        {priority}
      </span>
    );
  };

  // Derived filtered ticket list based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All Status' || ticket.status === filterStatus;
    
    const matchesCategory = filterCategory === 'All Categories' || ticket.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-50 text-gray-900 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between md:space-x-4">
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 md:mb-0"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-4 md:mb-0">
          <HelpCircle size={28} /> Help &amp; Support
        </h1>
        <button
          onClick={handleDashboardClick}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Go to Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('help')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'help' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Help Center
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            My Tickets
          </button>
        </nav>
      </div>

      {activeTab === 'help' && (
        <div className="space-y-6">
          {helpTopics.map((topic, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-1">{topic.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{topic.description}</p>

              <div className="space-y-2">
                {topic.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group border-b border-gray-200 py-2 cursor-pointer"
                  >
                    <summary className="flex items-center justify-between text-gray-800 font-medium hover:text-blue-600">
                      {faq.question}
                      <ChevronDown size={18} className="transition-transform group-open:rotate-180 text-gray-400" />
                    </summary>
                    <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10 text-center">
            <p className="mb-4 text-gray-600">Couldn't find what you're looking for?</p>
            <button 
              onClick={() => setShowTicketForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center mx-auto"
            >
              Create Support Ticket
            </button>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">My Support Tickets</h2>
            <button 
              onClick={() => setShowTicketForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              New Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 space-y-2 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option>All Categories</option>
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.assignedTo ? (
                        <span className="inline-flex items-center">
                          <User size={14} className="mr-1" />
                          {ticket.assignedTo}
                        </span>
                      ) : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                      {ticket.status === 'Resolved' && (
                        <button className="text-green-600 hover:text-green-800">Reopen</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No support tickets match your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Support Ticket</h3>
                <button 
                  onClick={() => setShowTicketForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitTicket}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={ticketForm.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Briefly describe your issue"
                    />
                  </div>
              
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={ticketForm.description}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide detailed information about your issue..."
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={ticketForm.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                    <div className="flex items-center">
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 flex items-center">
                        <Paperclip size={16} className="mr-2" />
                        <span>Add Files</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          multiple
                        />
                      </label>
                      <span className="ml-2 text-sm text-gray-500">Max 5MB each</span>
                    </div>
                    {ticketForm.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {ticketForm.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <button 
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyEmail"
                      name="notifyEmail"
                      checked={ticketForm.notifyEmail}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyEmail" className="ml-2 block text-sm text-gray-700">
                      Notify me via email about updates
                    </label>
                  </div>
              
                  {/* Smart Suggestions */}
                  {suggestedArticles.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <HelpCircle size={16} className="mr-1" />
                        Before you submit, check these resources:
                      </h4>
                      <ul className="space-y-2">
                        {suggestedArticles.map((article, index) => (
                          <li key={index} className="text-sm">
                            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                              {article.category}: {article.question}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              
                  {/* Always Show Live Chat Option */}
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle size={16} className="mr-1" />
                      Need immediate help?
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      For urgent issues, you can start a live chat with our support team.
                    </p>
                    <button 
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Start Live Chat
                    </button>
                  </div>
              
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">How was your support experience?</h3>
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 rounded-full ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star size={24} className="fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {feedbackRating === 0 ? 'Select your rating' : 
                     feedbackRating <= 2 ? 'We apologize for the inconvenience' :
                     feedbackRating <= 4 ? 'Thanks for your feedback' : 
                     'We\'re glad we could help!'}
                  </p>
                </div>

                <div>
                  <label htmlFor="feedbackComment" className="block text-sm font-medium text-gray-700 mb-1">Additional comments (optional)</label>
                  <textarea
                    id="feedbackComment"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us more about your experience..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={submitFeedback}
                    disabled={feedbackRating === 0}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${feedbackRating === 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;

