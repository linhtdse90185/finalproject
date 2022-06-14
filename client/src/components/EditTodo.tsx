import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import Swal from 'sweetalert2'
import { getUploadUrl, uploadFile, patchTodo } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
  selectedFile: any
  preview: any,
  todo: any,
  errorMessage: string
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: localStorage.getItem('IMAGE_URL') === 'null' ? null : localStorage.getItem('IMAGE_URL'),
    uploadState: UploadState.NoUpload,
    selectedFile: undefined,
    preview: undefined,
    todo: JSON.parse(localStorage.getItem('TODO') || '{}'),
    errorMessage: ''
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const imgUrl = files[0]
    
    const objectUrl = URL.createObjectURL(imgUrl);
    this.setState({
      file: imgUrl,
      preview: objectUrl,
      todo: {
        ...this.state.todo, attachmentUrl: imgUrl
      }
    })
  }

  onChangeName = (e: any) => {
    const todName = e.target.value;
    this.setState({
      todo: {...this.state.todo, name: todName}
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const _todoName = this.state.todo.name.trim();
    try {
      if (!_todoName) throw new Error('Name is required');
      // if (!this.state.file) {
      //   Swal.fire({
      //     icon: 'error',
      //     text: 'File should be selected'
      //   })
      //   return
      // }
      this.setUploadState(UploadState.UploadingFile);
      if (this.state.preview) {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(
          this.props.auth.getIdToken(),
          this.props.match.params.todoId
        )
        await uploadFile(uploadUrl, this.state.todo.attachmentUrl);
      }
      
      await patchTodo(this.props.auth.getIdToken(), this.state.todo.todoId, {
        name: _todoName,
        dueDate: this.state.todo.dueDate,
        done: this.state.todo.done
      });

      Swal.fire({
        icon: 'success',
        text: 'Updated successfully!'
      });
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Could not updated TODO',
        text: e.message
      })
      this.setState({
        todo: {...this.state.todo, name: _todoName}
      })
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Update TODO</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              type="text"
              placeholder="Name"
              value={this.state.todo.name}
              onChange={this.onChangeName}
            />
          </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
            {
              this.state.todo.attachmentUrl && ( <img style={{maxWidth: '600px', maxHeight: '600px'}} src={this.state.preview || this.state.todo.attachmentUrl} />)
            }
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <Button
        loading={this.state.uploadState !== UploadState.NoUpload}
        type="submit"
      >
        Submit
      </Button>
    )
  }
}
