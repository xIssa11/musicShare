import Amplify, { API, graphqlOperation } from '@aws-amplify/api'

import awsConfig from './aws-exports'
import { createGif, deleteGif, updateGif } from './graphql/mutations'
import { listGifs } from './graphql/queries'

Amplify.configure(awsConfig)

let currentGifId = ''

const editGif = async () => {
  try {
    await API.graphql(graphqlOperation(updateGif, {
      input: {
        id: currentGifId,
        altText: document.getElementById('edit-altText').value,
        url: document.getElementById('edit-url').value
      }
    }))
    getGifs()
  } catch (err) {
    console.error(err)
  }
}

const removeGif = async () => {
  await API.graphql(graphqlOperation(deleteGif, {
    input: { id: currentGifId }
  }))
}

const populateModal = gif => {
  currentGifId = gif.id
  document.getElementById('edit-modal').classList.remove('hidden')
  document.getElementById('edit-altText').value = gif.altText
  document.getElementById('edit-url').value = gif.url
}

const createGifUi = gif => {
  const img = document.createElement('img')
  img.setAttribute('src', gif.url)
  img.addEventListener('click', () => populateModal(gif))
  document.querySelector('.container').appendChild(img)
  closeCreateModal()
}

const getGifs = async () => {
  const container = document.querySelector('.container')
  container.innerHTML = ''
  const gifs = await API.graphql(graphqlOperation(listGifs))
  gifs.data.listGifs.items.map(createGifUi)
}

const createNewGif = async e => {
  e.preventDefault()

  const gif = {
    altText: document.getElementById('altText').value,
    url: document.getElementById('url').value
  }

  try {
    await API.graphql(graphqlOperation(createGif, { input: gif }))
    document.getElementById('create-form').reset()
    getGifs()
  } catch (err) {
    console.error(err)
  }
}

const closeModal = () => document.getElementById('edit-modal').classList.add('hidden')
const closeCreateModal = () => document.getElementById('create-modal').classList.add('hidden')

document.getElementById('close-edit-button').addEventListener('click', closeModal)
document.getElementById('close-create-button').addEventListener('click', closeCreateModal)

document.getElementById('create-form').addEventListener('submit', createNewGif)
document.getElementById('edit-form').addEventListener('submit', e => {
  e.preventDefault()
  editGif()
  closeModal()
})

document.getElementById('delete-button').addEventListener('click', () => {
  removeGif()
  getGifs()
  closeModal()
})

document.getElementById('plus-button').addEventListener('click',
  () => document.getElementById('create-modal').classList.remove('hidden'))

getGifs()
