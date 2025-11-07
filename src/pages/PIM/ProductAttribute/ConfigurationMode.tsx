import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Save, ChevronDown, ChevronRight, GripVertical, Settings, ArrowLeft } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ConfigurationMode({
  viewTemplates,
  setViewTemplates,
  activeViewId,
  picklistOptions,
  setPicklistOptions,
  setCurrentPage,
  handleSaveChanges,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [showPicklistDialog, setShowPicklistDialog] = useState(false);
  const [currentPicklistField, setCurrentPicklistField] = useState(null);
  const [newOption, setNewOption] = useState("");

  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0];

  useEffect(() => {
    const initialExpanded = {};
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true;
    });
    setExpandedSections(initialExpanded);
  }, [currentViewTemplate]);

  const filteredSections = currentViewTemplate.sections
    .filter((section) => section.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const addSection = (insertIndex = null) => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      order: insertIndex !== null ? insertIndex : currentViewTemplate.sections.length,
      attributes: [],
    };

    let updatedSections;
    if (insertIndex !== null) {
      updatedSections = [...currentViewTemplate.sections];
      updatedSections.splice(insertIndex, 0, newSection);
      updatedSections = updatedSections.map((section, index) => ({ ...section, order: index }));
    } else {
      updatedSections = [...currentViewTemplate.sections, newSection];
    }

    const updatedTemplate = {
      ...currentViewTemplate,
      sections: updatedSections,
      lastModified: new Date().toISOString().split("T")[0],
    };

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
    setExpandedSections((prev) => ({ ...prev, [newSection.id]: true }));
  };

  const deleteSection = (sectionId) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.filter((s) => s.id !== sectionId),
      lastModified: new Date().toISOString().split("T")[0],
    };
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
  };

  const handleSidebarDragEnd = (result) => {
    if (!result.destination) return;
    const sections = [...currentViewTemplate.sections];
    const [movedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, movedSection);

    const updatedTemplate = {
      ...currentViewTemplate,
      sections: sections.map((section, index) => ({ ...section, order: index })),
      lastModified: new Date().toISOString().split("T")[0],
    };
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
  };

  const handleFieldDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const sectionId = source.droppableId.replace("section-", "");
      const section = currentViewTemplate.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const newAttributes = Array.from(section.attributes);
      const [movedAttribute] = newAttributes.splice(source.index, 1);
      newAttributes.splice(destination.index, 0, movedAttribute);

      const updatedTemplate = {
        ...currentViewTemplate,
        sections: currentViewTemplate.sections.map((s) =>
          s.id === sectionId ? { ...s, attributes: newAttributes } : s
        ),
        lastModified: new Date().toISOString().split("T")[0],
      };
      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
      );
    } else {
      const sourceSectionId = source.droppableId.replace("section-", "");
      const destinationSectionId = destination.droppableId.replace("section-", "");
      const sourceSection = currentViewTemplate.sections.find((s) => s.id === sourceSectionId);
      const destinationSection = currentViewTemplate.sections.find((s) => s.id === destinationSectionId);
      if (!sourceSection || !destinationSection) return;

      const sourceAttributes = Array.from(sourceSection.attributes);
      const destinationAttributes = Array.from(destinationSection.attributes);
      const [movedAttribute] = sourceAttributes.splice(source.index, 1);
      destinationAttributes.splice(destination.index, 0, movedAttribute);

      const updatedTemplate = {
        ...currentViewTemplate,
        sections: currentViewTemplate.sections.map((s) => {
          if (s.id === sourceSectionId) return { ...s, attributes: sourceAttributes };
          if (s.id === destinationSectionId) return { ...s, attributes: destinationAttributes };
          return s;
        }),
        lastModified: new Date().toISOString().split("T")[0],
      };
      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
      );
    }
  };

  const updateAttribute = (sectionId, attributeId, updates) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              attributes: s.attributes.map((a) =>
                a.id === attributeId ? { ...a, ...updates } : a
              ),
            }
          : s
      ),
      lastModified: new Date().toISOString().split("T")[0],
    };
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
  };

  const deleteAttribute = (sectionId, attributeId) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId
          ? { ...s, attributes: s.attributes.filter((a) => a.id !== attributeId) }
          : s
      ),
      lastModified: new Date().toISOString().split("T")[0],
    };
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
  };

  const addAttribute = (sectionId) => {
    const newAttribute = { id: Date.now(), name: "New Field", type: "String", required: false };
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId ? { ...s, attributes: [...s.attributes, newAttribute] } : s
      ),
      lastModified: new Date().toISOString().split("T")[0],
    };
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
    );
  };

  const openPicklistOptions = (attributeId) => {
    setCurrentPicklistField(attributeId);
    setShowPicklistDialog(true);
  };

  const addPicklistOption = () => {
    if (!newOption.trim()) return;
    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: [...(prev[currentPicklistField] || []), newOption.trim()],
    }));
    setNewOption("");
  };

  const removePicklistOption = (index) => {
    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: prev[currentPicklistField].filter((_, i) => i !== index),
    }));
  };

  const handlePicklistOptionDragEnd = (result) => {
    if (!result.destination) return;
    const options = Array.from(picklistOptions[currentPicklistField] || []);
    const [movedOption] = options.splice(result.source.index, 1);
    options.splice(result.destination.index, 0, movedOption);
    setPicklistOptions((prev) => ({ ...prev, [currentPicklistField]: options }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-4/5 min-w-screen">
      {/* Configuration Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setCurrentPage("product")}
              className="flex items-center gap-2 px-2 py-1.6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="h-5 w-0.8 bg-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">Configure</h2>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={addSection}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-base text-gray-600 mb-3">Customize your product template structure</p>
          <DragDropContext onDragEnd={handleSidebarDragEnd}>
            <Droppable droppableId="sidebar-sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredSections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-200 rounded-md overflow-hidden group transition-all ${
                            snapshot.isDragging ? "shadow-lg" : "shadow-sm"
                          }`}
                        >
                          <div className="flex items-center bg-white">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 cursor-move hover:bg-gray-50 transition-colors"
                            >
                              <GripVertical className="w-3 h-3 text-gray-400" />
                            </div>
                            <button
                              onClick={() =>
                                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                              }
                              className="flex-1 p-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium text-gray-900 truncate">{section.title}</span>
                              </div>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {section.attributes.length}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteSection(section.id)}
                              aria-label={`Delete section ${section.title}`}
                              title={`Delete section ${section.title}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Configuration Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.6">
                Configure Template: {currentViewTemplate.name}
              </h1>
              <p className="text-gray-600 text-base">
                Drag fields between sections to reorganize your template
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage("views")}
                className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                Manage Views
              </button>
              <button
                onClick={() => {
                  console.log(
                    "View Structure:",
                    JSON.stringify(
                      {
                        id: currentViewTemplate.id,
                        name: currentViewTemplate.name,
                        sections: currentViewTemplate.sections.map((section) => ({
                          id: section.id,
                          title: section.title,
                          order: section.order,
                          attributes: section.attributes.map((attr) => {
                            const attributeData = { ...attr };
                            if (attr.type === "Picklist") {
                              attributeData.options = picklistOptions[attr.id] || [];
                            }
                            return attributeData;
                          }),
                        })),
                        picklistOptions: picklistOptions,
                      },
                      null,
                      2
                    )
                  );
                  handleSaveChanges();
                }}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Save className="w-3 h-3" /> Save Configuration
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <DragDropContext onDragEnd={handleFieldDragEnd}>
            <div className="space-y-5">
              {filteredSections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <div
                    id={section.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => toggleSection(section.id)}
                            aria-label={`Toggle section ${section.title}`}
                            title={`Toggle section ${section.title}`}
                            className="p-1.6 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            {expandedSections[section.id] ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <input
                            value={section.title}
                            onChange={(e) => {
                              const updatedTemplate = {
                                ...currentViewTemplate,
                                sections: currentViewTemplate.sections.map((s) =>
                                  s.id === section.id ? { ...s, title: e.target.value } : s
                                ),
                                lastModified: new Date().toISOString().split("T")[0],
                              };
                              setViewTemplates((prev) =>
                                prev.map((template) =>
                                  template.id === currentViewTemplate.id ? updatedTemplate : template
                                )
                              );
                            }}
                            aria-label="Section title"
                            title="Section title"
                            className="text-lg font-bold border-none shadow-none p-0 h-auto bg-transparent flex-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.8 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {section.attributes.length} fields
                          </span>
                          <button
                            onClick={() => deleteSection(section.id)}
                            aria-label={`Delete section ${section.title}`}
                            title={`Delete section ${section.title}`}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedSections[section.id] && (
                      <div className="p-3">
                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`space-y-2 min-h-[64px] p-3 rounded-md border-2 border-dashed transition-colors ${
                                snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
                              }`}
                            >
                              {section.attributes.map((attribute, index) => (
                                <Draggable
                                  key={attribute.id}
                                  draggableId={`attr-${attribute.id}`}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`p-3 bg-gray-50 rounded-md border group transition-all ${
                                        snapshot.isDragging
                                          ? "shadow-lg bg-white border-blue-300"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-move p-0.8 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                          <input
                                            value={attribute.name}
                                            onChange={(e) =>
                                              updateAttribute(section.id, attribute.id, { name: e.target.value })
                                            }
                                            aria-label={`Field name for ${attribute.name}`}
                                            title="Field name"
                                            className="font-semibold border-none shadow-none p-0 h-auto bg-transparent text-sm w-full focus:outline-none"
                                            placeholder="Field name"
                                          />
                                        </div>
                                        <button
                                          onClick={() => deleteAttribute(section.id, attribute.id)}
                                          aria-label={`Delete field ${attribute.name}`}
                                          title={`Delete field ${attribute.name}`}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 h-6 w-6 p-0 rounded-md hover:bg-red-50 flex items-center justify-center"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">
                                            Type
                                          </label>
                                          <select
                                            value={attribute.type}
                                            onChange={(e) =>
                                              updateAttribute(section.id, attribute.id, { type: e.target.value })
                                            }
                                            aria-label={`Field type for ${attribute.name}`}
                                            title="Field type"
                                            className="w-full h-7 text-xs border border-gray-300 rounded-md px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                          >
                                            <option value="String">Text</option>
                                            <option value="Number">Number</option>
                                            <option value="Boolean">Yes/No</option>
                                            <option value="Date">Date</option>
                                            <option value="Text">Long Text</option>
                                            <option value="Rich Text">Rich Text</option>
                                            <option value="Picklist">Dropdown</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1.6">
                                            Required
                                          </label>
                                          <div className="flex items-center gap-2 h-7">
                                            <label className="relative inline-flex items-center cursor-pointer w-9 h-5">
                                              <input
                                                type="checkbox"
                                                checked={attribute.required}
                                                onChange={(e) =>
                                                  updateAttribute(section.id, attribute.id, {
                                                    required: e.target.checked,
                                                  })
                                                }
                                                aria-label={`Mark ${attribute.name} as required`}
                                                title={`Mark ${attribute.name} as required`}
                                                className="sr-only peer"
                                              />
                                              <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200"></div>
                                              <div className="absolute left-[1.6px] top-[1.6px] w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
                                            </label>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">
                                            Options
                                          </label>
                                          <div className="h-7 flex items-center">
                                            {attribute.type === "Picklist" && (
                                              <button
                                                onClick={() => openPicklistOptions(attribute.id)}
                                                aria-label={`Configure picklist options for ${attribute.name}`}
                                                title="Configure picklist options"
                                                className="h-6 px-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-center"
                                              >
                                                <Settings className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">
                                            Status
                                          </label>
                                          <div className="flex flex-wrap gap-0.8 h-7 items-center">
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full">
                                              {attribute.type}
                                            </span>
                                            {attribute.required && (
                                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full">
                                                Required
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <button
                                onClick={() => addAttribute(section.id)}
                                className="w-full flex items-center justify-center gap-2 mt-2 border-2 border-dashed border-gray-300 h-10 text-xs rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                              >
                                <Plus className="w-3 h-3" /> Add Field
                              </button>
                              {section.attributes.length === 0 && (
                                <div className="text-center text-gray-500 py-6">
                                  <p className="text-xs font-medium">No fields in this section</p>
                                  <p className="text-xs">Drag fields here from other sections</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </div>

                  {sectionIndex < filteredSections.length - 1 && (
                    <div className="flex justify-center py-3">
                      <button
                        onClick={() => addSection(sectionIndex + 1)}
                        className="flex items-center gap-2 border-2 border-dashed border-gray-300 h-8 text-xs px-5 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Section
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-center py-3">
                <button
                  onClick={() => addSection()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-300 h-8 text-xs px-5 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Section
                </button>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Picklist Dialog */}
      {showPicklistDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-3">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Manage Picklist Options</h3>
              <p className="text-xs text-gray-600 mt-1.6">
                Add, remove, or reorder options for this picklist field. Changes will be saved when you save the product.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter new option"
                  title="Enter new picklist option"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPicklistOption();
                    }
                  }}
                />
                <button
                  onClick={addPicklistOption}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="border border-gray-200 rounded-md">
                <DragDropContext onDragEnd={handlePicklistOptionDragEnd}>
                  <Droppable droppableId="picklist-options">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="p-1.6">
                        {currentPicklistField &&
                          (picklistOptions[currentPicklistField] || []).map((option, index) => (
                            <Draggable
                              key={`${option}-${index}`}
                              draggableId={`${option}-${index}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-2 bg-gray-50 rounded-md mb-1.6 group transition-all ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">{option}</span>
                                  </div>
                                  <button
                                    onClick={() => removePicklistOption(index)}
                                    aria-label={`Remove option ${option}`}
                                    title={`Remove option ${option}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md flex items-center justify-center"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                        {currentPicklistField &&
                          (!picklistOptions[currentPicklistField] ||
                            picklistOptions[currentPicklistField].length === 0) && (
                            <div className="p-6 text-center text-gray-500">
                              <p className="font-medium text-xs">No options added yet</p>
                              <p className="text-xs">Add your first option above</p>
                            </div>
                          )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPicklistDialog(false)}
                className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
