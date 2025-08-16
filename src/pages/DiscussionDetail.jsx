import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLanguage } from '../contexts/LanguageContext'
import * as discussionsApi from '../services/api/discussions'

const DiscussionDetail = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => discussionsApi.getDiscussion(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  const addCommentMutation = useMutation({
    mutationFn: (payload) => discussionsApi.addComment(id, payload),
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['discussion', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('discussions_loading')}</span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">Error Loading Discussion</div>
        <p className="text-red-700 mb-4">{t('error_generic') || 'Failed to load discussion. Please try again later.'}</p>
        <Link to="/discussions" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          {t('back') || 'Back'}
        </Link>
      </div>
    )
  }

  const discussion = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{discussion.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">{discussion.category}</span>
            <span>👤 {discussion.author}</span>
            {discussion.date ? <span>📅 {new Date(discussion.date).toLocaleString()}</span> : null}
            <span>👍 {discussion.likes || 0}</span>
          </div>
        </div>
        <Link to="/discussions" className="text-blue-600 hover:text-blue-800 font-medium">{t('back') || 'Back to discussions'}</Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>

        {Array.isArray(discussion.tags) && discussion.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {discussion.tags.map((tag, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('discussions_comments') || 'Comments'}</h3>
        {Array.isArray(discussion.comments) && discussion.comments.length > 0 ? (
          <div className="space-y-4">
            {discussion.comments.map((c, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">
                  👤 {c.created_by || 'anonymous'} • {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                </div>
                <div className="text-gray-700">{c.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">{t('discussions_no_comments') || 'No comments yet.'}</div>
        )}

        {/* Add comment form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!comment.trim()) return
            addCommentMutation.mutate({ content: comment.trim() })
          }}
          className="mt-6 space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700">{t('add_comment') || 'Add a comment'}</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('type_your_comment') || 'Type your comment...'}
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {addCommentMutation.isPending ? (t('posting') || 'Posting…') : (t('post') || 'Post')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DiscussionDetail
