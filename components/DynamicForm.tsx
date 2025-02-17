'use client'
import { useState } from 'react';
import Sections from './Section';
import type { SectionProps } from './Section';

const DynamicForm = () => {
  const [Url, setUrl] = useState('');
  const [Audience, setAudience] = useState('');
  const [Ad, setAd] = useState('');
  const [Popularity, setPopularity] = useState(0);
  const [Familiarity, setFamiliarity] = useState(0);
  const [showAudienceField, setShowAudienceField] = useState(false);
  const [showAdField, setShowAdField] = useState(false);
  const [showbrandsPopularity, setShowbrandsPopularity] = useState(false);
  const [showFamiliaritywithProductCategory, setShowFamiliaritywithProductCategory] = useState(false);

  const [result, setResult] = useState<SectionProps['sections'] | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/getSections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: Url,
          Audience: showAudienceField ? Audience : '',
          Ad: showAdField ? Ad : '',
          brandsPopularity: showbrandsPopularity ? Popularity : 0,
          FamilaritywithProductCategory: showFamiliaritywithProductCategory ? Familiarity : 0,
          
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const resultData = await response.json();
      setResult(resultData as SectionProps['sections']);
     
     
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="Url" className="block text-sm font-medium text-gray-700">Product Url:</label>
        <input
          type="text"
          id="Url"
          value={Url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Toggle for Audience */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showAudienceField}
            onChange={(e) => setShowAudienceField(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Include Audience</span>
        </label>
      </div>

      {/* Audience Field */}
      {showAudienceField && (
      <div className="mb-4">
        <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience</label>
        <textarea
          id="audience"
          value={Audience}
          onChange={(e) => setAudience(e.target.value)}
          className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      )}


      {/* Toggle for Ad */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showAdField}
            onChange={(e) => setShowAdField(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Include Ad</span>
        </label>
      </div>

      {/* Ad Field */}
      {showAdField && (
      <div className="mb-4">
        <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Ad</label>
        <textarea
          id="ad"
          value={Ad}
          onChange={(e) => setAd(e.target.value)}
          className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      )}

{/* Toggle for Brands Popularity  */}
<div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showbrandsPopularity}
            onChange={(e) => setShowbrandsPopularity(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Include Brands Popularity</span>
        </label>
      </div>

      {/* Brands Popularity  */}
      {showbrandsPopularity && (
      <div className="mb-4">
        <label htmlFor="pop" className="block text-sm font-medium text-gray-700"> Brands Populairty</label>
        <input
          id="pop"
          value={Popularity}
          type='number'
          onChange={(e) => setPopularity(e.target.value as unknown as number)}
          className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      )}

<div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showFamiliaritywithProductCategory}
            onChange={(e) => setShowFamiliaritywithProductCategory(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Include Familiarity with Product Category</span>
        </label>
      </div>

      {/*FamiliaritywithProductCategory Field */}
      {showFamiliaritywithProductCategory && (
      <div className="mb-4">
        <label htmlFor="fam" className="block text-sm font-medium text-gray-700">Brands Familiarity</label>
        <input
          id="fam"
          type='number'
          value={Familiarity}
          onChange={(e) => setFamiliarity(e.target.value as unknown as number)}
          className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Send Request
      </button>
    </form>

  <Sections  />
    
     
    

    
   
   
    
    </>
  );
};

export default DynamicForm;