
/**
 * @description  WebRTC Mesh Network Service.
 * @purpose      Establish direct P2P link without a backend signaling server.
 * @protocol     Manual SDP Exchange (The "Air-Gap" Handshake).
 */

export type Role = 'host' | 'guest' | 'none';
export type Status = 'offline' | 'gathering' | 'waiting' | 'connected';

export interface Packet {
  type: 'move';
  payload: string; // FEN
}

export class Mesh {
  private peer: RTCPeerConnection;
  private channel: RTCDataChannel | null = null;
  public status: Status = 'offline';
  
  // Callbacks
  public onSignal: (token: string) => void = () => {};
  public onConnect: () => void = () => {};
  public onData: (data: Packet) => void = () => {};
  public onStatus: (status: Status) => void = () => {};

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peer.onicecandidate = (event) => {
      if (event.candidate === null) {
        // Gathering complete. Ready to export SDP.
        const sdp = JSON.stringify(this.peer.localDescription);
        // Compress (Base64) to make it look like a "Token"
        const token = btoa(sdp);
        this.onSignal(token);
        if (this.peer.localDescription?.type === 'offer') {
            this.update('waiting');
        }
      }
    };

    this.peer.onconnectionstatechange = () => {
      if (this.peer.connectionState === 'connected') {
        this.update('connected');
        this.onConnect();
      } else if (this.peer.connectionState === 'disconnected') {
        this.update('offline');
      }
    };
  }

  private update(s: Status) {
      this.status = s;
      this.onStatus(s);
  }

  // 1. HOST: Create Room
  public host() {
    this.update('gathering');
    this.channel = this.peer.createDataChannel("ares");
    this.setup(this.channel);
    
    this.peer.createOffer()
      .then(offer => this.peer.setLocalDescription(offer));
  }

  // 2. GUEST: Join Room (Input Host Token)
  public join(token: string) {
    this.update('gathering');
    this.peer.ondatachannel = (event) => {
      this.channel = event.channel;
      this.setup(this.channel);
    };

    const offer = JSON.parse(atob(token));
    this.peer.setRemoteDescription(offer);
    
    this.peer.createAnswer()
      .then(answer => this.peer.setLocalDescription(answer));
  }

  // 3. HOST: Accept Answer (Input Guest Token)
  public accept(token: string) {
    const answer = JSON.parse(atob(token));
    this.peer.setRemoteDescription(answer);
  }

  public send(data: Packet) {
    if (this.channel?.readyState === 'open') {
      this.channel.send(JSON.stringify(data));
    }
  }

  private setup(channel: RTCDataChannel) {
    channel.onopen = () => {
        this.update('connected');
        this.onConnect();
    };
    channel.onmessage = (event) => {
      const packet = JSON.parse(event.data);
      this.onData(packet);
    };
  }
}
