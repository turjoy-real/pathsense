"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Target,
  Map,
  Trophy,
  BookOpen,
  CheckCircle,
  Circle,
  ExternalLink,
  Brain,
  Code,
  BarChart3,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const CareerLearningApp = () => {
  const [activeScreen, setActiveScreen] = useState("explore");
  const [exploreData, setExploreData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conceptData, setConceptData] = useState(null);
  const [quizData, setQuizData] = useState(null);

  // Explore form state
  const [exploreForm, setExploreForm] = useState({
    goal: "",
    pythonLevel: 5,
    javaLevel: 5,
    cppLevel: 5,
    frameworks: "",
    linearAlgebra: 5,
    calculus: 5,
    probability: 5,
    statistics: 5,
    dataSkills: "",
    problemSolving: 5,
    creativeThinking: 5,
    communication: 5,
    interestArea: "",
    learningStyle: "self-paced",
  });

  const handleExploreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = JSON.stringify({
        goal: exploreForm.goal,
        current_skills: {
          programming_languages: {
            Python: exploreForm.pythonLevel,
            Java: exploreForm.javaLevel,
            "C++": exploreForm.cppLevel,
          },
          frameworks: exploreForm.frameworks
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),
          mathematics: {
            linear_algebra: exploreForm.linearAlgebra,
            calculus: exploreForm.calculus,
            probability: exploreForm.probability,
            statistics: exploreForm.statistics,
          },
          data_skills: exploreForm.dataSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        traits: {
          problem_solving: exploreForm.problemSolving,
          creative_thinking: exploreForm.creativeThinking,
          communication: exploreForm.communication,
          interest_area: exploreForm.interestArea,
          learning_style: exploreForm.learningStyle,
        },
        exploration_preferences: {
          test_subskills: true,
          provide_links_for_assessment: true,
          suggest_alternative_roles: true,
        },
      });
      console.log("sending:", body);
      const response = await fetch(`${API_BASE}/explore-career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });
      const data = await response.json();
      setExploreData(data);
      console.log("exploreData:", data);
    } catch (error) {
      console.error("Error exploring careers:", error);
    }
    setLoading(false);
  };

  const handleSetCareer = async (role) => {
    setLoading(true);
    try {
      const selectedRole = exploreData.career_paths.find(
        (r) => r.role === role
      );
      const response = await fetch(`${API_BASE}/set-career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "user123",
          goal: exploreForm.goal,
          chosen_role: role,
          roadmap: selectedRole.roadmap.map((module) => ({
            title: module.module_title,
            description: module.description,
            duration: module.duration,
            completed: false,
            topics: module.topics.map((topic) => ({
              title: topic.title,
              description: topic.description,
              completed: false,
              resources: topic.resources || [],
            })),
          })),
        }),
      });
      const data = await response.json();
      setLearningPath(selectedRole);
      console.log("learningPath:", selectedRole);
      setActiveScreen("learn");
    } catch (error) {
      console.error("Error setting career:", error);
    }
    setLoading(false);
  };

  const fetchConcept = async (topic) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      setConceptData(data);
    } catch (error) {
      console.error("Error fetching concept:", error);
    }
    setLoading(false);
  };

  const fetchQuiz = async (topic, level = "beginner") => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      const data = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
    setLoading(false);
  };

  const toggleTopicComplete = (moduleIdx, topicIdx) => {
    setLearningPath((prev) => {
      const updated = { ...prev };
      updated.roadmap[moduleIdx].topics[topicIdx].completed =
        !updated.roadmap[moduleIdx].topics[topicIdx].completed;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Career Path
              </span>
            </div>
            <div className="flex space-x-1 bg-indigo-50 rounded-lg p-1">
              {[
                { id: "explore", label: "Explore", icon: Target },
                { id: "learn", label: "Learn", icon: Map },
                { id: "achieve", label: "Achieve", icon: Trophy },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveScreen(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeScreen === id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeScreen === "explore" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Explore Your Career Path
              </h1>
              <p className="text-lg text-gray-600">
                Tell us about your goals and skills to find the perfect AI
                career
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <form onSubmit={handleExploreSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Career Goal
                  </label>
                  <input
                    type="text"
                    value={exploreForm.goal}
                    onChange={(e) =>
                      setExploreForm({ ...exploreForm, goal: e.target.value })
                    }
                    placeholder="e.g., I want to be an AI Engineer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Python Level ({exploreForm.pythonLevel}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={exploreForm.pythonLevel}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          pythonLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Java Level ({exploreForm.javaLevel}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={exploreForm.javaLevel}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          javaLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      C++ Level ({exploreForm.cppLevel}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={exploreForm.cppLevel}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          cppLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frameworks (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={exploreForm.frameworks}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          frameworks: e.target.value,
                        })
                      }
                      placeholder="Spring Boot, Docker, React"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={exploreForm.dataSkills}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          dataSkills: e.target.value,
                        })
                      }
                      placeholder="SQL, Pandas, NumPy"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Area
                    </label>
                    <input
                      type="text"
                      value={exploreForm.interestArea}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          interestArea: e.target.value,
                        })
                      }
                      placeholder="math and coding"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <select
                      value={exploreForm.learningStyle}
                      onChange={(e) =>
                        setExploreForm({
                          ...exploreForm,
                          learningStyle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    >
                      <option value="self-paced">Self-Paced</option>
                      <option value="structured">Structured</option>
                      <option value="interactive">Interactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 text-gray-700">
                    Mathematics Skills
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Linear Algebra:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.linearAlgebra}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.linearAlgebra}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            linearAlgebra: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Calculus:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.calculus}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.calculus}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            calculus: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Probability:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.probability}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.probability}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            probability: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Statistics:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.statistics}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.statistics}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            statistics: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 text-gray-700">
                    Personal Traits
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Problem Solving:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.problemSolving}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.problemSolving}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            problemSolving: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Creative Thinking:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.creativeThinking}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.creativeThinking}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            creativeThinking: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-gray-700">
                        Communication:{" "}
                        <span className="text-purple-400 font-bold text-gray-700">
                          {exploreForm.communication}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={exploreForm.communication}
                        onChange={(e) =>
                          setExploreForm({
                            ...exploreForm,
                            communication: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Exploring...</span>
                  ) : (
                    <>
                      <span>Explore Career Paths</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {exploreData && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recommended Career Paths
                </h2>
                {exploreData.career_paths.map((path, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {path.role}
                        </h3>
                        <p className="text-gray-600 mt-1">{path.overview}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {path.estimated_timeline}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-3">
                        <strong>Why this fits:</strong> {path.fit}
                      </p>
                    </div>
                    <div className="mb-4">
                      <strong className="text-sm text-gray-700">
                        Key Skills:
                      </strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {path.key_skills_to_learn.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSetCareer(path.role)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Choose This Path
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeScreen === "learn" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Learning Roadmap
              </h1>
              <p className="text-lg text-gray-600">
                Follow your personalized path to becoming an AI professional
              </p>
            </div>

            {!learningPath ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Learning Path Set
                </h3>
                <p className="text-gray-600 mb-6">
                  Please explore career paths first and choose one to get
                  started
                </p>
                <button
                  onClick={() => setActiveScreen("explore")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Go to Explore
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    {learningPath.chosen_role}
                  </h2>
                  <p className="text-indigo-100">Goal: {learningPath.goal}</p>
                </div>

                {learningPath.roadmap.map((module, moduleIdx) => (
                  <div
                    key={moduleIdx}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {module.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                        {module.duration}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {module.topics.map((topic, topicIdx) => (
                        <div
                          key={topicIdx}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() =>
                                toggleTopicComplete(moduleIdx, topicIdx)
                              }
                              className="mt-1 flex-shrink-0"
                            >
                              {topic.completed ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-300" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {topic.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {topic.description}
                              </p>
                              {topic.resources &&
                                topic.resources.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {topic.resources.map((resource, i) => (
                                      <a
                                        key={i}
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Resource {i + 1}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => fetchConcept(topic.title)}
                                  className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-sm hover:bg-indigo-100"
                                >
                                  Learn Concept
                                </button>
                                <button
                                  onClick={() =>
                                    fetchQuiz(topic.title, "beginner")
                                  }
                                  className="px-3 py-1 bg-purple-50 text-purple-600 rounded text-sm hover:bg-purple-100"
                                >
                                  Take Quiz
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {conceptData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Concept Details
                    </h3>
                    <button
                      onClick={() => setConceptData(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(conceptData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {quizData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Quiz</h3>
                    <button
                      onClick={() => setQuizData(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(quizData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeScreen === "achieve" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Track Your Achievements
              </h1>
              <p className="text-lg text-gray-600">
                Monitor your progress and celebrate your milestones
              </p>
            </div>

            {!learningPath ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Progress Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your learning journey to track achievements
                </p>
                <button
                  onClick={() => setActiveScreen("explore")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Progress Overview
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {learningPath.roadmap.map((module, idx) => {
                      const totalTopics = module.topics.length;
                      const completedTopics = module.topics.filter(
                        (t) => t.completed
                      ).length;
                      const progress = (completedTopics / totalTopics) * 100;

                      return (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4"
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {module.title}
                          </h3>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>
                                {completedTopics} / {totalTopics} completed
                              </span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Completed Topics
                  </h2>
                  <div className="space-y-2">
                    {learningPath.roadmap.flatMap((module) =>
                      module.topics
                        .filter((t) => t.completed)
                        .map((topic) => (
                          <div
                            key={topic.title}
                            className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {topic.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {topic.description}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                    {learningPath.roadmap
                      .flatMap((m) => m.topics)
                      .filter((t) => t.completed).length === 0 && (
                      <p className="text-gray-600 text-center py-8">
                        No topics completed yet. Keep learning!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerLearningApp;
