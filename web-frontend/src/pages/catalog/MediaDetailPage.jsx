import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function MediaDetailPage() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get(`/catalog/${id}`)
      .then((response) => setMedia(response.data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Media not found.'));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!media) return <p>Loading media...</p>;
  return (
    <article className="card">
      <h2>{media.title}</h2>
      <p>{media.type} {media.releaseYear ? `(${media.releaseYear})` : ''}</p>
      <p>{media.synopsis}</p>
      <p>{(media.genres || []).join(' - ')}</p>
    </article>
  );
}
