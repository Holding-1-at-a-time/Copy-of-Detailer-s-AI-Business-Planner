import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Organization, Role } from '../types';
import Spinner from './Spinner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, organization, showToast }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'knowledge'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 max-w-2xl w-full m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-400">Organization Settings</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-2 bg-gray-900/50">
          <div className="flex space-x-2">
            <TabButton name="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <TabButton name="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
            <TabButton name="Knowledge" isActive={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && <GeneralSettingsTab organization={organization} showToast={showToast} />}
            {activeTab === 'members' && <MembersSettingsTab organization={organization} showToast={showToast} />}
            {activeTab === 'knowledge' && <KnowledgeBaseTab organization={organization} showToast={showToast} />}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
        {name}
    </button>
);

const GeneralSettingsTab: React.FC<Omit<SettingsModalProps, 'isOpen' | 'onClose'>> = ({ organization, showToast }) => {
    const [name, setName] = useState(organization.name);
    const updateName = useMutation(api.organizations.updateName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || name === organization.name) return;
        setIsSaving(true);
        try {
            await updateName({ orgId: organization._id as Id<"organizations">, name: name.trim() });
            showToast("Organization name updated successfully!", 'success');
        } catch (error) {
            console.error(error);
            showToast("Failed to update name. Only admins can perform this action.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-300 mb-1">Organization Name</label>
                <input id="orgName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving || !name.trim() || name === organization.name} className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center">
                    {isSaving && <Spinner size="sm"/>}<span className={isSaving ? 'ml-2' : ''}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </div>
    );
};

const MembersSettingsTab: React.FC<Omit<SettingsModalProps, 'isOpen' | 'onClose'>> = ({ organization, showToast }) => {
    const data = useQuery(api.organizations.getDetails, { orgId: organization._id as Id<"organizations"> });
    const allUsers = useQuery(api.users.list);

    const updateRole = useMutation(api.memberships.updateRole);
    const removeMember = useMutation(api.memberships.removeMember);
    const addMember = useMutation(api.memberships.addMember);

    const [userToAdd, setUserToAdd] = useState('');
    
    const usersNotInOrg = allUsers?.filter(u => !data?.members.some(m => m.userId === u._id));

    const handleRoleChange = async (membershipId: Id<"memberships">, role: Role) => {
        try {
            await updateRole({ membershipId, role });
            showToast("Member's role updated!", 'success');
        } catch (error) {
            console.error(error);
            showToast("Failed to update role. Only admins can perform this action.", 'error');
        }
    };
    
    const handleRemoveMember = async (membershipId: Id<"memberships">) => {
        if (window.confirm("Are you sure you want to remove this member from the organization?")) {
            try {
                await removeMember({ membershipId });
                showToast("Member removed.", 'success');
            } catch (error) {
                console.error(error);
                showToast("Failed to remove member. Only admins can perform this action.", 'error');
            }
        }
    };
    
    const handleAddMember = async () => {
        if (!userToAdd) return;
        try {
            await addMember({ orgId: organization._id as Id<"organizations">, userId: userToAdd as Id<"users"> });
            showToast("Member added successfully.", 'success');
            setUserToAdd('');
        } catch (error) {
            console.error(error);
            showToast("Failed to add member. They may already be in the organization.", 'error');
        }
    };

    if (data === undefined || allUsers === undefined) return <div className="flex justify-center"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Add New Member</h3>
                <div className="flex space-x-2">
                    <select value={userToAdd} onChange={e => setUserToAdd(e.target.value)} className="flex-grow bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                        <option value="">Select a user to add...</option>
                        {usersNotInOrg?.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
                    </select>
                    <button onClick={handleAddMember} disabled={!userToAdd} className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition disabled:bg-green-800 disabled:cursor-not-allowed">Add</button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Current Members</h3>
                <ul className="space-y-2">
                    {data.members.map(member => (
                        <li key={member.membershipId} className="bg-gray-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
                            <span className="font-medium text-white">{member.name}</span>
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                <select value={member.role} onChange={e => handleRoleChange(member.membershipId as Id<"memberships">, e.target.value as Role)} className="bg-gray-700 border-none text-white rounded p-1 text-sm">
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                </select>
                                <button onClick={() => handleRemoveMember(member.membershipId as Id<"memberships">)} className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded-full transition" title="Remove member">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const KnowledgeBaseTab: React.FC<Omit<SettingsModalProps, 'isOpen' | 'onClose'>> = ({ organization, showToast }) => {
    const articles = useQuery(api.rag.listArticles, { orgId: organization._id });
    const addArticle = useMutation(api.rag.addArticle);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !text.trim()) {
            showToast("Title and content are required.", 'error');
            return;
        }
        setIsSaving(true);
        try {
            await addArticle({ orgId: organization._id, title: title.trim(), text: text.trim() });
            setTitle('');
            setText('');
            showToast("Article added to knowledge base!", 'success');
        } catch (error) {
            console.error("Failed to add article:", error);
            showToast("Failed to add article.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Add to Knowledge Base</h3>
                <p className="text-sm text-gray-400 mb-4">Add articles, procedures, or product info. The AI will use this content to provide more relevant answers.</p>
                <form onSubmit={handleAddArticle} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Article Title (e.g., 'Ceramic Coating Aftercare')"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                        placeholder="Article content..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 h-32 focus:ring-2 focus:ring-indigo-500"
                        rows={5}
                    />
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving || !title.trim() || !text.trim()} className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition disabled:bg-green-800 disabled:cursor-not-allowed flex items-center">
                            {isSaving && <Spinner size="sm" />}<span className={isSaving ? 'ml-2' : ''}>{isSaving ? 'Saving...' : 'Add Article'}</span>
                        </button>
                    </div>
                </form>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Existing Articles</h3>
                {articles === undefined && <div className="flex justify-center"><Spinner /></div>}
                {articles && articles.length === 0 && <p className="text-sm text-gray-500">No articles have been added yet.</p>}
                <ul className="space-y-2">
                    {articles?.map(article => (
                        <li key={article._id} className="bg-gray-900 p-3 rounded-lg">
                            <p className="font-medium text-white truncate">{article.title}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SettingsModal;