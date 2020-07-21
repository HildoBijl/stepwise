import React, { useRef, useEffect, createContext, useContext } from 'react'

import { Typography } from '@material-ui/core'
import { useUser } from '../api/user'

import cat from '../logo/logo.svg'
import dog from '../logo/logo.svg'

export default function History() {
	const user = useUser()

	return (
		<>
			<Typography variant='body1'>This is a dummy page to test sub-pages.</Typography>
			<Typography variant='body1'>The user's name is {user ? user.name : 'unknown: he is not logged in'}.</Typography>
			<ChapterOnAnimals />
		</>
	)
}

function ChapterOnAnimals() {
	return (
		<Chapter>
			<p>This chapter shows various animals.</p>
			<p>In image <ImageNumber id="cat" /> you see a cat.</p>
			<Image src={cat} id="cat" caption="This is a cat." />
			<p>Next, in image <ImageNumber id="dog" />, you see a dog.</p>
			<Image src={dog} id="dog" caption="This is a dog." />
			<p>This is the end of the chapter.</p>
		</Chapter>
	)
}

const ChapterContext = createContext({})

function Chapter({ children }) {
	const chapterRef = useRef(null)
	const imageTracker = useRef({})

	const updateImageNumbers = () => {
		const imageTags = [...chapterRef.current.querySelectorAll('.image')]
		Object.values(imageTracker.current).forEach(imageData => {
			const imageIndex = imageTags.indexOf(imageData.ref.current)
			if (imageIndex === -1)
				delete imageData.number
			else
				imageData.number = imageIndex + 1 // Count from 1.
		})
	}
	const registerImage = (id, ref) => {
		imageTracker.current[id] = { ref }
		updateImageNumbers()
	}
	const unregisterImage = (id) => {
		delete imageTracker.current[id]
		updateImageNumbers()
	}

	const data = {
		registerImage,
		unregisterImage,
		imageData: imageTracker.current,
	}

	return (
		<ChapterContext.Provider value={data}>
			<div className="chapter" ref={chapterRef}>
				{children}
			</div>
		</ChapterContext.Provider>
	)
}

function Image({ src, id, caption }) {
	const imageRef = useRef(null)
	useImageTracking(id, imageRef)
	const num = useImageNumber(id)

	return <div className="image" ref={imageRef}>
		<img src={src} alt="id" />
		<div className="caption">Figure {num}: {caption}</div>
	</div>
}

function ImageNumber({ id }) {
	return <span className="imageNumber">{useImageNumber(id)}</span>
}

function useImageTracking(id, imageRef) {
	const { registerImage, unregisterImage } = useContext(ChapterContext)
	useEffect(() => {
		registerImage(id, imageRef)
		return () => unregisterImage(id)
	}, [id, imageRef])
}

function useImageNumber(id) {
	const { imageData } = useContext(ChapterContext)
	return (imageData && imageData[id] && imageData[id].number) || '?'
}